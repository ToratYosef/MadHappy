"use client";

import { useState } from "react";
import Link from "next/link";
import { CartItemRow } from "@/components/CartItemRow";
import { CartSummary } from "@/components/CartSummary";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-10 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Cart</p>
          <h1 className="text-3xl font-semibold">Your bag</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm underline-offset-4 transition hover:text-forest hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-8 text-center shadow-soft">
          <p className="text-lg font-semibold">Your bag is quiet.</p>
          <p className="text-ink/60">Start with the Crest hoodie or Signal tee.</p>
          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-full bg-forest px-5 py-3 text-background"
          >
            Back to shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow key={`${item.id}-${item.size}`} item={item} />
            ))}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </div>
          <CartSummary items={items} onCheckout={handleCheckout} loading={loading} />
        </div>
      )}
    </main>
  );
}
