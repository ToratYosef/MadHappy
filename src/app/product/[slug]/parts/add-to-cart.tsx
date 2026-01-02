'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useCartDrawer } from '@/lib/cart-drawer-store';
import { formatCurrency } from '@/lib/utils';

interface Props {
  product: {
    id: string;
    printifyProductId: string;
    title: string;
    slug: string;
    images: string[];
    options: { name: string; values: string[] }[];
    variants: {
      variantId: string;
      title: string;
      priceCents: number;
      options: Record<string, string>;
      isEnabled: boolean;
    }[];
  };
}

export default function AddToCart({ product }: Props) {
  const initialSelections = Object.fromEntries(
    product.options.map((opt) => [opt.name, opt.values[0]])
  );
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartDrawer((s) => s.open);

  const variantLookup = product.variants.reduce<Record<string, (typeof product.variants)[number]>>((acc, variant) => {
    const key = product.options
      .map((opt) => {
        const normalizedOptions = Object.fromEntries(
          Object.entries(variant.options || {}).map(([k, v]) => [k.toLowerCase(), v])
        );
        return (
          variant.options?.[opt.name] ||
          normalizedOptions[opt.name.toLowerCase()] ||
          ''
        );
      })
      .join('|');
    acc[key] = variant;
    return acc;
  }, {});

  const selectionKey = product.options.map((opt) => selections[opt.name]).join('|');
  const variant = variantLookup[selectionKey] || product.variants[0];

  const handleAdd = () => {
    if (!variant) return;
    addItem({
      productId: product.printifyProductId,
      variantId: variant.variantId,
      name: product.title,
      slug: product.slug,
      priceCents: variant.priceCents,
      imageUrl: product.images[0],
      variantTitle: variant.title,
      options: selections,
      qty
    });
    openDrawer();
  };

  return (
    <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft">
      {product.options.map((opt) => (
        <div key={opt.name}>
          <p className="text-sm font-semibold">{opt.name}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {opt.values.map((value) => (
              <button
                key={value}
                onClick={() => setSelections((prev) => ({ ...prev, [opt.name]: value }))}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  selections[opt.name] === value ? 'border-green bg-green/10 text-green' : 'border-black/10 bg-white'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
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
        Add to cart · {formatCurrency((variant?.priceCents ?? 0) * qty, 'USD')}
      </button>
    </div>
  );
}
