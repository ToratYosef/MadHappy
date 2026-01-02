'use client';

import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import { useCartStore } from '@/lib/cart-store';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { useTransition } from 'react';

export default function CartPage() {
  const { items, updateQty, removeItem, clear } = useCartStore();
  const [loading, startTransition] = useTransition();
  const subtotal = items.reduce((acc, item) => acc + item.priceCents * item.qty, 0);

  const handleCheckout = async () => {
    startTransition(async () => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })) })
      });
      const data = await res.json();
      if (data.url) {
        clear();
        window.location.href = data.url;
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex-1 py-10">
        <h1 className="mb-6 text-3xl font-semibold">Your cart</h1>
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.length === 0 && <p className="text-black/60">No items yet.</p>}
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-soft">
                {item.imageUrl && (
                  <div className="relative h-24 w-20 overflow-hidden rounded-lg border border-black/5">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.14em] text-black/50">{item.size}</p>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-black/60">{formatCurrency(item.priceCents)}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <label>Qty</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={item.qty}
                      onChange={(e) => updateQty(item.variantId, Number(e.target.value))}
                      className="h-9 w-16 rounded-lg border border-black/10 bg-white px-2"
                    />
                  </div>
                </div>
                <button onClick={() => removeItem(item.variantId)} className="text-sm text-black/60 hover:text-red-500">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-xl border border-black/5 bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-xl font-semibold">Summary</h2>
            <div className="flex items-center justify-between py-2 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm text-black/60">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="button-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Checkout with Stripe'}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
