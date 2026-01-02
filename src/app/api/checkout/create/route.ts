import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

type CartItem = { productId: string; variantId: string; qty: number };
type CheckoutPayload = {
  items: CartItem[];
  customer: { name?: string; email: string; phone?: string };
  shipping: {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal?: string;
    country?: string;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutPayload;
    const items = body.items || [];

    if (!items.length) return NextResponse.json({ error: 'No items' }, { status: 400 });
    if (!body.customer?.email) return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
    if (
      !body.shipping?.address1 ||
      !body.shipping?.city ||
      !body.shipping?.state ||
      !body.shipping?.postal ||
      !body.shipping?.country
    ) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.printifyVariantCache.findMany({
      where: { variantId: { in: variantIds }, isEnabled: true },
      include: { product: true }
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json({ error: 'One or more variants are invalid or disabled' }, { status: 400 });
    }

    let subtotalCents = 0;

    const orderItems: {
      printifyProductId: string;
      variantId: string;
      qty: number;
      priceCents: number;
      title: string;
      variantTitle: string | null;
      imageUrl?: string | null;
      options: Record<string, string>;
    }[] = [];

    for (const cartItem of items) {
      const variant = variants.find((v) => v.variantId === cartItem.variantId);
      if (!variant || variant.product.printifyProductId !== cartItem.productId) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
      }

      const priceCents = variant.priceCents;
      subtotalCents += priceCents * cartItem.qty;

      orderItems.push({
        printifyProductId: variant.product.printifyProductId,
        variantId: variant.variantId,
        qty: cartItem.qty,
        priceCents,
        title: variant.product.title,
        variantTitle: variant.title,
        imageUrl: Array.isArray(variant.product.images) ? variant.product.images[0] : null,
        options: variant.options || {}
      });
    }

    if (subtotalCents <= 0) {
      return NextResponse.json({ error: 'Invalid cart amount' }, { status: 400 });
    }

    const shippingCents = 0;
    const totalCents = subtotalCents + shippingCents;
    const orderId = randomUUID();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: body.customer.email,
      metadata: {
        orderId,
        items: JSON.stringify(items)
      }
    });

    await prisma.order.create({
      data: {
        id: orderId,
        stripePaymentIntentId: paymentIntent.id,
        customerName: body.customer?.name || null,
        customerEmail: body.customer.email,
        customerPhone: body.customer?.phone || null,
        shippingName: body.shipping?.name || body.customer?.name || null,
        shippingAddress1: body.shipping?.address1 || null,
        shippingAddress2: body.shipping?.address2 || null,
        shippingCity: body.shipping?.city || null,
        shippingState: body.shipping?.state || null,
        shippingPostal: body.shipping?.postal || null,
        shippingCountry: body.shipping?.country || null,
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'DRAFT',
        subtotalCents,
        shippingCents,
        totalCents,
        items: {
          createMany: {
            data: orderItems
          }
        }
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId
    });
  } catch (error) {
    console.error('Checkout create error', error);
    return NextResponse.json({ error: 'Failed to create checkout session', details: String(error) }, { status: 500 });
  }
}
