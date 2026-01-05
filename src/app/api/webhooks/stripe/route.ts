import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { submitOrderToPrintify } from '@/lib/printify-order';

async function handlePaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  let order = await prisma.order.findFirst({
    where: {
      OR: [{ stripePaymentIntentId: paymentIntent.id }, orderId ? { id: orderId } : undefined].filter(Boolean) as any
    },
    include: { items: true }
  });

  if (!order) {
    console.error('Order not found for payment intent', paymentIntent.id);
    return;
  }

  if (order.paymentStatus !== 'PAID') {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', fulfillmentStatus: 'PROCESSING' }
    });

    // Submit to Printify after payment is confirmed
    try {
      await submitOrderToPrintify(order.id);
      console.log('✅ Order submitted to Printify:', order.id);
    } catch (error) {
      console.error('❌ Failed to submit order to Printify:', error);
      // Don't throw - order is paid, manual submission can happen via admin panel
    }
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature || '', process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Stripe webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await prisma.webhookEvent.create({
      data: { source: 'stripe', eventType: event.type, payload: event as any }
    });
  } catch (error) {
    console.error('Failed to persist Stripe webhook', error);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        await handlePaymentIntent(event.data.object as Stripe.PaymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { paymentStatus: 'FAILED' }
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
