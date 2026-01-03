'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  product: any;
  selections: Record<string, string>;
  setSelections: (s: Record<string,string>) => void;
}

const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

export default function GalleryClient({ product, selections, setSelections }: Props) {
  const selectedColorOption = product.options.find((opt: any) => opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colors');
  const selectedColor = selectedColorOption ? selections[selectedColorOption.name] : null;

  const [mappings, setMappings] = useState<Record<string, Record<string,string>>>({});
  useEffect(() => {
    fetch('/api/admin/image-mappings')
      .then((r) => r.json())
      .then(setMappings)
      .catch(() => setMappings({}));
  }, []);

  // build variant map
  const colorToVariantIds = new Map<string, string[]>();
  (product.variants || []).forEach((v: any) => {
    Object.values(v.options || {}).forEach((val: any) => {
      if (val === undefined || val === null) return;
      const norm = normalize(String(val));
      const arr = colorToVariantIds.get(norm) || [];
      arr.push(String(v.variantId));
      colorToVariantIds.set(norm, arr);
    });
  });

  const mappedForProduct = mappings?.[product.printifyProductId] || {};

  const displayImages = (() => {
    if (!selectedColor || !product.images || product.images.length === 0) return product.images || [];

    // 1) check saved mappings: find image URLs mapped to this color
    const byMapping = Object.entries(mappedForProduct)
      .filter(([, color]) => normalize(color) === normalize(selectedColor))
      .map(([img]) => img);
    if (byMapping.length > 0) return byMapping;

    // 2) variant id matching
    const variantIds = colorToVariantIds.get(normalize(selectedColor)) || [];
    if (variantIds.length > 0) {
      const byVariant = (product.images || []).filter((img: string) => variantIds.some((id) => img.includes(id)));
      if (byVariant.length > 0) return byVariant;
    }

    // 3) fallback color name heuristic
    const normColor = normalize(selectedColor);
    const matched = (product.images || []).filter((img: string) => normalize(img).includes(normColor));
    return matched.length > 0 ? matched : (product.images || []);
  })();

  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [displayImages.length, selectedColor]);

  const featured = displayImages[index] || product.images?.[0];
  const thumbs = displayImages.length ? displayImages : product.images || [];

  return (
    <div className="space-y-4">
      {featured && (
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
          <Image src={featured} alt={product.title} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 90vw" priority />
        </div>
      )}
      {thumbs.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {thumbs.map((img: string, idx: number) => (
            <button key={img + idx} onClick={() => setIndex(idx)} className={`relative aspect-square overflow-hidden rounded-lg border ${idx === index ? 'border-green' : 'border-black/5'}`}>
              <Image src={img} alt={`${product.title} - ${idx + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
