import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { productId: string; variantId: string; qty: number }[] = body.items || [];
    if (!items.length) return NextResponse.json({ error: 'No items' }, { status: 400 });

    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds }, active: true },
      include: { product: { include: { images: true } } }
    });

    let totalAmount = 0;
    let currency = 'usd';

    for (const cartItem of items) {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      if (!variant || !variant.product.active || variant.inventoryQty < cartItem.qty) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
      }

      totalAmount += variant.product.priceCents * cartItem.qty;
      currency = variant.product.currency;
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const lineItems = items.map((cartItem) => {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      return {
        quantity: cartItem.qty,
        price_data: {
          currency: (variant?.product.currency || currency).toLowerCase(),
          unit_amount: variant?.product.priceCents ?? 0,
          product_data: {
            name: `${variant?.product.name || 'Item'}${variant?.size ? ` - ${variant.size}` : ''}`,
            images: variant?.product.images?.length ? [variant.product.images[0].url] : undefined
          }
        }
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded',
      line_items: lineItems,
      return_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      payment_intent_data: {
        metadata: {
          variantIds: JSON.stringify(variantIds),
          items: JSON.stringify(items)
        }
      }
    });

    if (!session.client_secret) {
      console.error('No client secret returned from Stripe', session);
      return NextResponse.json({ error: 'Failed to create checkout session', details: session }, { status: 500 });
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}
