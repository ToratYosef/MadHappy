import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { submitOrderToPrintify } from '@/lib/printify-order';

export const runtime = 'nodejs';

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  console.log('🔍 Payment intent succeeded:', {
    paymentIntentId: paymentIntent.id,
    orderId,
    amount: paymentIntent.amount,
    status: paymentIntent.status
  });

  if (!orderId) {
    console.log('⚠️ No orderId in payment intent metadata (likely a test event)', paymentIntent.id);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      items: true
    }
  });

  if (!order) {
    console.log('❌ Order not found for payment intent (likely a test event)', paymentIntent.id, 'orderId:', orderId);
    return;
  }

  console.log('📦 Found order:', {
    orderId: order.id,
    email: order.customerEmail,
    currentStatus: order.paymentStatus,
    itemCount: order.items.length
  });

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: { 
      paymentStatus: 'PAID',
      fulfillmentStatus: 'PROCESSING',
      stripePaymentIntentId: paymentIntent.id
    }
  });

  // Update product sold counts
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        soldCount: {
          increment: item.qty
        }
      }
    });
  }

  console.log(`✅ Payment succeeded for order ${order.id} - Updated to PAID/PROCESSING`);

  // Auto-submit to Printify
  try {
    console.log(`📤 Auto-submitting order ${order.id} to Printify...`);
    const printifyOrder = await submitOrderToPrintify(order.id);
    console.log(`✅ Order ${order.id} submitted to Printify as ${printifyOrder.id}`);
  } catch (error: any) {
    console.error(`❌ Failed to auto-submit order ${order.id} to Printify:`, error.message);
    // Don't fail the webhook if Printify submission fails - admin can retry manually
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.log('No orderId in failed payment intent metadata (likely a test event)', paymentIntent.id);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    console.log('Order not found for failed payment (likely a test event)', paymentIntent.id);
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { 
      paymentStatus: 'FAILED'
    }
  });

  console.log(`❌ Payment failed for order ${orderId}`);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Log webhook event
  try {
    await prisma.webhookEvent.create({
      data: { 
        source: 'stripe', 
        eventType: event.type, 
        payload: event as any 
      }
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }

  // Handle the event
  try {
    console.log(`📨 Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      
      case 'charge.succeeded': {
        console.log('Charge succeeded:', event.data.object.id);
        break;
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { 
              paymentStatus: 'PAID',
              fulfillmentStatus: 'PROCESSING'
            }
          });
          console.log(`Checkout session completed for order ${orderId}`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('🚨 Stripe webhook handler error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
}
