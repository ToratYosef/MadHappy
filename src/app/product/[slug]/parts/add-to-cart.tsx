'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useCartDrawer } from '@/lib/cart-drawer-store';
import { formatCurrency } from '@/lib/utils';
import type { PrintifyImage, PrintifyOption, PrintifyVariant } from '@/types/printify';
import { buildSelectionKey, buildVariantLookup, getInitialSelections } from './selection-helpers';

interface Props {
  product: {
    id: string;
    printifyProductId: string;
    title: string;
    slug: string;
    images: PrintifyImage[];
    options: PrintifyOption[];
    variants: PrintifyVariant[];
  };
  initialSelections?: Record<string, string>;
  onSelectionChange?: (selections: Record<string, string>) => void;
  onVariantChange?: (variant: PrintifyVariant | null) => void;
  selectedImageUrl?: string | null;
}

export default function AddToCart({
  product,
  initialSelections,
  onSelectionChange,
  onVariantChange,
  selectedImageUrl
}: Props) {
  const defaultSelections = useMemo(
    () => initialSelections ?? getInitialSelections(product.options, product.variants),
    [initialSelections, product.options, product.variants]
  );
  const [selections, setSelections] = useState<Record<string, string>>(defaultSelections);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartDrawer((s) => s.open);

  const variantLookup = buildVariantLookup(product.options, product.variants);

  const selectionKey = buildSelectionKey(product.options, selections);
  const variant = variantLookup[selectionKey] || product.variants[0];

  const imageForCart = selectedImageUrl || product.images[0]?.url || null;

  const handleAdd = () => {
    if (!variant) return;
    addItem({
      productId: product.printifyProductId,
      variantId: variant.variantId,
      name: product.title,
      slug: product.slug,
      priceCents: variant.priceCents,
      imageUrl: imageForCart ?? undefined,
      variantTitle: variant.title,
      options: selections,
      qty
    });
    openDrawer();
  };

  const handleSelection = (name: string, value: string) => {
    setSelections((prev) => ({ ...prev, [name]: value }));
  };

  // Keep parent informed of selections + variant for image filtering
  // and variant-specific UI updates.
  useEffect(() => {
    onSelectionChange?.(selections);
  }, [selections, onSelectionChange]);

  useEffect(() => {
    onVariantChange?.(variant ?? null);
  }, [variant, onVariantChange]);

  useEffect(() => {
    setSelections(defaultSelections);
  }, [defaultSelections]);

  return (
    <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft">
      {product.options.map((opt) => (
        <div key={opt.name}>
          <p className="text-sm font-semibold">{opt.name}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {opt.values.map((value) => (
              <button
                key={value}
                onClick={() => handleSelection(opt.name, value)}
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
