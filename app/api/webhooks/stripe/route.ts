import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

type OrderRecord = {
  orderId: string;
  stripeSessionId: string;
  items: unknown;
  amount: number | null;
  currency: string | null;
  email: string | null | undefined;
  status: string;
  createdAt: string;
};

const ordersFile = path.join(process.cwd(), "data", "orders.json");

async function appendOrder(order: OrderRecord) {
  await fs.mkdir(path.dirname(ordersFile), { recursive: true });
  try {
    const existing = await fs.readFile(ordersFile, "utf8");
    const data = existing ? JSON.parse(existing) : [];
    data.push(order);
    await fs.writeFile(ordersFile, JSON.stringify(data, null, 2));
  } catch (error) {
    await fs.writeFile(ordersFile, JSON.stringify([order], null, 2));
  }
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order: OrderRecord = {
      orderId: session.id,
      stripeSessionId: session.id,
      items: session.metadata?.cart ? JSON.parse(session.metadata.cart) : [],
      amount: session.amount_total,
      currency: session.currency,
      email: session.customer_details?.email,
      status: session.payment_status,
      createdAt: new Date().toISOString()
    };
    await appendOrder(order);
  }

  return NextResponse.json({ received: true });
}
