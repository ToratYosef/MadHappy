'use client';

import { useState } from 'react';
import { Variant } from '@prisma/client';
import { useCartStore } from '@/lib/cart-store';
import { useCartDrawer } from '@/lib/cart-drawer-store';
import { formatCurrency } from '@/lib/utils';

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    images: { url: string }[];
    variants: Variant[];
  };
}

export default function AddToCart({ product }: Props) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartDrawer((s) => s.open);

  const variant = product.variants.find((v) => v.id === variantId);

  const handleAdd = () => {
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      imageUrl: product.images[0]?.url,
      size: variant.size,
      qty
    });
    openDrawer();
  };

  return (
    <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft">
      <div>
        <p className="text-sm font-semibold">Select size</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                variantId === v.id ? 'border-green bg-green/10 text-green' : 'border-black/10 bg-white'
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-black/70">Qty</label>
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-20 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
      </div>
      <button onClick={handleAdd} className="button-primary w-full">
        Add to cart · {formatCurrency(product.priceCents * qty, product.currency)}
      </button>
    </div>
  );
}
