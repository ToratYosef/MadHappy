import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature || '', process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
      if (existing) return NextResponse.json({ received: true });

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const items = lineItems.data;

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber: `LKH-${Math.floor(Math.random() * 999999)}`,
            email: session.customer_details?.email || 'unknown',
            status: 'PAID',
            fulfillmentStatus: 'UNFULFILLED',
            currency: session.currency || 'usd',
            subtotalCents: session.amount_subtotal ?? 0,
            shippingCents: session.total_details?.amount_shipping ?? 0,
            totalCents: session.amount_total ?? 0,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            shippingName: session.customer_details?.name,
            shippingAddress1: session.customer_details?.address?.line1,
            shippingAddress2: session.customer_details?.address?.line2,
            shippingCity: session.customer_details?.address?.city,
            shippingState: session.customer_details?.address?.state,
            shippingPostal: session.customer_details?.address?.postal_code,
            shippingCountry: session.customer_details?.address?.country
          }
        });

        for (const item of items) {
          const metadata = item.price?.metadata as Stripe.Metadata | undefined;
          const variantId = metadata?.variantId;
          const productId = metadata?.productId;

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: productId ?? undefined,
              nameSnapshot: item.description ?? item.price?.nickname ?? 'Item',
              priceCentsSnapshot: item.amount_subtotal ?? 0,
              qty: item.quantity ?? 1,
              imageSnapshot: item.price?.product_data?.images?.[0],
              size: undefined
            }
          });

          if (variantId) {
            await tx.variant.update({
              where: { id: variantId },
              data: { inventoryQty: { decrement: item.quantity || 1 } }
            });
          }
        }
      });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.order.updateMany({ where: { stripeSessionId: session.id }, data: { status: 'CANCELED' } });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
