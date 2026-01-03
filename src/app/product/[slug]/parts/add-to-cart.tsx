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
  selections?: Record<string,string>;
  onChangeSelections?: (s: Record<string,string>) => void;
}

// Color mapping for visual display
const COLOR_MAP: Record<string, string> = {
  'White': '#FFFFFF',
  'Ash': '#B2BEB5',
  'Black': '#000000',
  'Sand': '#C2B280',
  'Sport Grey': '#8B8589',
  'Gold': '#FFD700',
  'Orange': '#FF8C00',
  'Safety Orange': '#FF6600',
  'Maroon': '#800000',
  'Dark Chocolate': '#3B2414',
  'Safety Green': '#00FF00',
  'Military Green': '#4B5320',
  'Kiwi': '#8EE53F',
  'Forest Green': '#228B22',
  'Graphite Heather': '#5F6368',
  'Irish Green': '#009A49',
  'Dark Heather': '#616161',
  'Light Blue': '#ADD8E6',
  'Carolina Blue': '#56A0D3',
  'Heather Sport Dark Navy': '#2C3E50',
  'Heather Sport Royal': '#4169E1',
  'Indigo Blue': '#4B0082',
  'Antique Sapphire': '#2C5F7C',
  'Charcoal': '#36454F',
  'Royal': '#002366',
  'Navy': '#000080',
  'Heather Navy': '#1C2841',
  'Orchid': '#DA70D6',
  'Purple': '#800080',
  'Light Pink': '#FFB6C1',
  'Azalea': '#F19CBB',
  'Safety Pink': '#FF6FFF',
  'Heliconia': '#FF1493',
  'Red': '#FF0000',
  'Antique Cherry Red': '#9B111E',
  'Cherry Red': '#DE3163',
  'Garnet': '#9A2A2A',
  'Cardinal Red': '#C41E3A'
};

const ALLOWED_COLORS = new Set(Object.keys(COLOR_MAP));

export default function AddToCart({ product, selections: controlledSelections, onChangeSelections }: Props & { selections?: Record<string,string>, onChangeSelections?: (s: Record<string,string>) => void }) {
  const initialSelections = Object.fromEntries(
    product.options.map((opt) => [opt.name, opt.values[0]])
  );
  const [internalSelections, setInternalSelections] = useState<Record<string, string>>(initialSelections);
  const selections = controlledSelections ?? internalSelections;
  const setSelections = (next: Record<string,string>) => {
    if (onChangeSelections) onChangeSelections(next);
    else setInternalSelections(next);
  };
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

  // Get images for selected color variant
  const selectedColorOption = product.options.find(opt =>
    opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colors'
  );
  const selectedColor = selectedColorOption ? selections[selectedColorOption.name] : null;

  // Heuristic: filter images whose filename/url contains the color name (normalized).
  const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
  // Build a map from normalized option values -> variantIds (robust across option key names)
  const colorToVariantIds = new Map<string, string[]>();
  product.variants.forEach((v) => {
    Object.values(v.options || {}).forEach((val) => {
      if (val === undefined || val === null) return;
      const norm = normalize(String(val));
      const arr = colorToVariantIds.get(norm) || [];
      arr.push(String(v.variantId));
      colorToVariantIds.set(norm, arr);
    });
  });

  const variantIdsForSelectedColor = selectedColor ? (colorToVariantIds.get(normalize(selectedColor)) || []) : [];

  const displayImages = (() => {
    if (!selectedColor || product.images.length === 0) return product.images;

    // 1) Try variant-id match in image URL (reliable for Printify mockups)
    if (variantIdsForSelectedColor.length > 0) {
      const byVariant = product.images.filter((img) =>
        variantIdsForSelectedColor.some((id) => img.includes(id))
      );
      if (byVariant.length > 0) return byVariant;
    }

    // 2) Fallback to color name heuristic
    const normColor = normalize(selectedColor);
    const matched = product.images.filter((img) => normalize(img).includes(normColor));
    // debug info
    try {
      // eslint-disable-next-line no-console
      console.debug('color match', { selectedColor, variantIdsForSelectedColor, matchedCount: matched.length, totalImages: product.images.length });
    } catch (e) {}
    return matched.length > 0 ? matched : product.images;
  })();

  // Gallery is now handled by the page-level client. AddToCart only handles selections and add-to-cart.

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

  // Map of normalized allowed color -> original allowed color key
  const normalizedAllowed = new Map<string, string>();
  Object.keys(COLOR_MAP).forEach((k) => normalizedAllowed.set(k.replace(/[^a-z0-9]/gi, '').toLowerCase(), k));

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Gallery moved to page-level component */}

      {/* Form */}
      <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft h-fit">
        {product.options.map((opt) => {
          const isColorOption = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colors';
          
          // Build normalized set of available option values from variants (robust across option keys)
          const availableNormalized = new Set<string>();
          product.variants.forEach(v => {
            Object.values(v.options || {}).forEach((val) => {
              if (val === undefined || val === null) return;
              availableNormalized.add(normalize(String(val)));
            });
          });

          // Show all option values; for colors we'll visually mark availability
          const filteredValues = opt.values || [];

          if (filteredValues.length === 0) return null;

          return (
            <div key={opt.name}>
              <p className="text-sm font-semibold mb-3">{opt.name}</p>
              {isColorOption ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredValues.map((value) => {
                        const norm = normalize(value);
                        const allowedKey = normalizedAllowed.get(norm) ?? value;
                        const colorHex = COLOR_MAP[allowedKey];

                        const isSelected = selections[opt.name] === value;
                        const isAvailable = availableNormalized.has(norm);

                        return (
                          <button
                            key={value}
                            onClick={() => isAvailable && setSelections((prev) => ({ ...prev, [opt.name]: value }))}
                            disabled={!isAvailable}
                            className={`relative h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center ${
                              isSelected ? 'border-green scale-110 shadow-lg' : 'border-black/20 hover:border-black/40'
                            } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: colorHex ?? '#efefef' }}
                            title={value}
                            aria-label={value}
                          >
                            {!colorHex && <span className="text-xs text-black/60">{value?.[0]?.toUpperCase() ?? '?'}</span>}
                            {value === 'White' && (
                              <div className="absolute inset-0 rounded-full border border-black/10" />
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-green shadow-md" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredValues.map((value) => (
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
              )}
            </div>
          );
        })}
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
        
      </div>
  );
}
