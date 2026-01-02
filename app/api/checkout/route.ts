import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe";
import { findProductBySlug } from "@/lib/products";

type RequestItem = {
  slug: string;
  size: string;
  qty: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: RequestItem[] = body.items;
    const stripe = getStripeClient();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const lineItems = items.map((item) => {
      const product = findProductBySlug(item.slug);
      if (!product) {
        throw new Error(`Product not found: ${item.slug}`);
      }
      const quantity = Number(item.qty) || 1;
      return {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: `${product.description} — Size ${item.size}`,
            images: product.images
          }
        }
      };
    });

    const headersList = headers();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? headersList.get("origin");

    if (!origin) {
      return NextResponse.json(
        { error: "Unable to resolve site origin" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        cart: JSON.stringify(items)
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
