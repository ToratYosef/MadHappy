'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useCartDrawer } from '@/lib/cart-drawer-store';
import { formatCurrency } from '@/lib/utils';
import { getFeaturedImage } from '@/lib/printify-images';
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
  const toHashColor = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 45%, 55%)`;
  };

  const resolveSwatchColor = (value: string) => {
    const normalized = value.trim();
    const map: Record<string, string> = {
      black: '#111111',
      white: '#f7f7f7',
      navy: '#0f1d3b',
      'dark navy': '#0d1630',
      'navy blue': '#0f1d3b',
      'sport grey': '#a8a8a8',
      'charcoal': '#4a4a4a',
      'ash': '#d6d6d6',
      'sand': '#d4c5a5',
      'safety orange': '#ff7a00',
      'safety green': '#8bc53f',
      'forest green': '#2f5d37',
      'military green': '#4b5320',
      'kiwi': '#7fbf3f',
      'irish green': '#008645',
      'dark heather': '#414141',
      'graphite heather': '#5b6066',
      'heather navy': '#2c3a52',
      'heather sport dark navy': '#1f2b3f',
      'heather sport royal': '#1c4fa1',
      'indigo blue': '#274472',
      'light blue': '#8fbbe8',
      'carolina blue': '#4f87c3',
      'antique sapphire': '#0e8fc9',
      'royal': '#1f4ea3',
      'purple': '#6a2da8',
      'orchid': '#c17dc8',
      'light pink': '#f6c4d5',
      'azalea': '#e92f8d',
      'safety pink': '#ff69b4',
      'heliconia': '#e20074',
      'red': '#d02626',
      'antique cherry red': '#a02128',
      'cherry red': '#c21834',
      'garnet': '#7e1e34',
      'cardinal red': '#9d2235',
      'dark chocolate': '#4b2e2b',
      'gold': '#d4af37',
      'orange': '#f2841f',
      'maroon': '#6d0019'
    };

    const key = normalized.toLowerCase();
    return map[key] || toHashColor(normalized);
  };

  const isColorOption = (name: string) => /color/i.test(name);

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

  const variantImage = useMemo(
    () => getFeaturedImage(product.images, variant?.variantId),
    [product.images, variant?.variantId]
  );

  const imageForCart = selectedImageUrl || variantImage?.url || product.images[0]?.url || null;

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
          {isColorOption(opt.name) ? (
            <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-6">
              {opt.values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleSelection(opt.name, value)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                    selections[opt.name] === value
                      ? 'border-green ring-2 ring-green/40'
                      : 'border-black/10'
                  }`}
                  style={{
                    backgroundColor: resolveSwatchColor(value)
                  }}
                  title={value}
                  aria-label={value}
                >
                  <span className="sr-only">{value}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {opt.values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleSelection(opt.name, value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    selections[opt.name] === value
                      ? 'border-green bg-green/10 text-green'
                      : 'border-black/10 bg-white'
                  }`}
                  title={value}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
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
