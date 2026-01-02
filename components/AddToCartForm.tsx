"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { mapProductToCartItem, useCart } from "@/store/cart";

type Props = {
  product: Product;
};

export function AddToCartForm({ product }: Props) {
  const [size, setSize] = useState(product.variants[0]?.size ?? "OS");
  const [qty, setQty] = useState(1);
  const addItem = useCart((state) => state.addItem);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addItem(mapProductToCartItem(product, size, qty));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/70 p-6 shadow-soft">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Size</p>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant.size}
              type="button"
              onClick={() => setSize(variant.size)}
              className={`rounded-full border px-4 py-2 text-sm uppercase ${
                size === variant.size
                  ? "border-forest bg-forest text-background"
                  : "border-ink/15 text-ink/70"
              }`}
            >
              {variant.size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.2em] text-ink/50">Qty</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            className="rounded-full border border-ink/20 px-3 py-1"
          >
            −
          </button>
          <span className="min-w-[32px] text-center font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((prev) => prev + 1)}
            className="rounded-full border border-ink/20 px-3 py-1"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-forest px-6 py-3 text-background transition hover:-translate-y-[1px] hover:shadow-lg"
      >
        Add to cart
      </button>
    </form>
  );
}
