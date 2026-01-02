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

  const createOrderFromPaymentIntent = async (
    paymentIntent: Stripe.PaymentIntent,
    session?: Stripe.Checkout.Session
  ) => {
    const existing = await prisma.order.findFirst({
      where: {
        OR: [
          { stripePaymentIntentId: paymentIntent.id },
          session?.id ? { stripeSessionId: session.id } : undefined
        ].filter(Boolean) as any
      }
    });
    if (existing) return existing;

    const items = JSON.parse(paymentIntent.metadata?.items || '[]');
    if (!Array.isArray(items) || items.length === 0) {
      console.error('Missing items metadata on payment intent', paymentIntent.id);
      return null;
    }

    const variantIds = items.map((i: any) => i.variantId).filter(Boolean);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { include: { images: true } } }
    });

    const customer = session?.customer_details;
    const address = customer?.address;

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `LKH-${Math.floor(Math.random() * 999999)}`,
          email: customer?.email || paymentIntent.receipt_email || 'unknown',
          status: 'PAID',
          fulfillmentStatus: 'UNFULFILLED',
          currency: paymentIntent.currency || 'usd',
          subtotalCents: paymentIntent.amount ?? 0,
          shippingCents: 0,
          totalCents: paymentIntent.amount ?? 0,
          stripeSessionId: session?.id || paymentIntent.id,
          stripePaymentIntentId: paymentIntent.id,
          shippingName: customer?.name || null,
          shippingAddress1: address?.line1 || null,
          shippingAddress2: address?.line2 || null,
          shippingCity: address?.city || null,
          shippingState: address?.state || null,
          shippingPostal: address?.postal_code || null,
          shippingCountry: address?.country || null
        }
      });

      for (const item of items) {
        const variant = variants.find((v) => v.id === item.variantId);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: variant?.productId,
            nameSnapshot: variant?.product.name || 'Item',
            priceCentsSnapshot: variant?.product.priceCents ?? 0,
            imageSnapshot: variant?.product.images?.[0]?.url,
            size: variant?.size,
            qty: item.qty ?? 1
          }
        });

        if (variant) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { inventoryQty: { decrement: item.qty || 1 } }
          });
        }
      }

      return order;
    });
  };

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        await createOrderFromPaymentIntent(paymentIntent, session);
      } else {
        console.error('No payment_intent on completed session', session.id);
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await createOrderFromPaymentIntent(paymentIntent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
