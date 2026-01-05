import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { generateOrderNumber } from '@/lib/order-number';

const getPrimaryProductImageUrl = (images: any): string | null => {
  if (!Array.isArray(images)) return null;
  const first = images[0];
  if (!first) return null;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && 'url' in first && typeof (first as any).url === 'string') {
    return (first as any).url;
  }
  return null;
};

const normalizeVariantOptions = (options: any): Record<string, string> => {
  if (!options || typeof options !== 'object' || Array.isArray(options)) return {};
  return Object.fromEntries(
    Object.entries(options as Record<string, unknown>)
      .map(([key, value]) => [key, value == null ? '' : String(value)])
      .filter(([, value]) => value !== '')
  );
};

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
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isEnabled: true },
      include: { product: true }
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json({ error: 'One or more variants are invalid or disabled' }, { status: 400 });
    }

    let subtotalCents = 0;

    const orderItems: {
      productId: string;
      variantId: string;
      qty: number;
      priceCents: number;
      title: string;
      variantTitle: string | null;
      imageUrl?: string | null;
      options: Record<string, string>;
    }[] = [];

    for (const cartItem of items) {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      if (!variant || variant.product.id !== cartItem.productId) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 });
      }

      const priceCents = variant.priceCents;
      subtotalCents += priceCents * cartItem.qty;

      orderItems.push({
        productId: variant.product.id,
        variantId: variant.id,
        qty: cartItem.qty,
        priceCents,
        title: variant.product.title,
        variantTitle: variant.title,
        imageUrl: getPrimaryProductImageUrl(variant.product.images),
        options: normalizeVariantOptions(variant.options)
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
        orderId
      }
    });

    // Try to create order with generated order number, retry if duplicate
    let orderNumber: string | null = null;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries && !orderNumber) {
      try {
        const generated = await generateOrderNumber();
        await prisma.order.create({
          data: {
            id: orderId,
            orderNumber: generated,
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
        orderNumber = generated;
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('orderNumber')) {
          // Duplicate orderNumber, retry
          retries++;
          if (retries >= maxRetries) {
            throw new Error('Failed to generate unique order number after retries');
          }
        } else {
          throw error;
        }
      }
    }

    if (!orderNumber) {
      throw new Error('Failed to generate order number');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId
    });
  } catch (error) {
    console.error('Checkout create error', error);
    return NextResponse.json({ error: 'Failed to create checkout session', details: String(error) }, { status: 500 });
  }
}
