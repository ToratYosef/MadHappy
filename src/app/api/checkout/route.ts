import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { productId: string; variantId: string; qty: number }[] = body.items || [];
    if (!items.length) return NextResponse.json({ error: 'No items' }, { status: 400 });

    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds }, active: true },
      include: { product: true }
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const cartItem of items) {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      if (!variant || !variant.product.active || variant.inventoryQty < cartItem.qty) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
      }

      lineItems.push({
        quantity: cartItem.qty,
        price_data: {
          currency: variant.product.currency,
          unit_amount: variant.product.priceCents,
          product_data: {
            name: `${variant.product.name} (${variant.size})`
          },
          metadata: {
            productId: variant.productId,
            variantId: variant.id
          }
        }
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        variantIds: JSON.stringify(variantIds)
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
