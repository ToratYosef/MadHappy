'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PrintifyImage, PrintifyProduct } from '@/types/printify';

interface Props {
  product: PrintifyProduct;
  selections: Record<string, string>;
}

const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();

export default function GalleryClient({ product, selections }: Props) {
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
  (product.variants || []).forEach((v) => {
    Object.values(v.options || {}).forEach((val) => {
      if (val === undefined || val === null) return;
      const norm = normalize(String(val));
      const arr = colorToVariantIds.get(norm) || [];
      arr.push(String(v.variantId));
      colorToVariantIds.set(norm, arr);
    });
  });

  const mappedForProduct = mappings?.[product.printifyProductId] || {};

  const allImages: PrintifyImage[] = Array.isArray(product.images) ? product.images : [];

  const displayImages: PrintifyImage[] = (() => {
    if (!selectedColor || allImages.length === 0) return allImages;

    // 1) check saved mappings: find image URLs mapped to this color
    const byMappingUrls = Object.entries(mappedForProduct)
      .filter(([, color]) => normalize(color) === normalize(selectedColor))
      .map(([img]) => img);
    const byMapping = byMappingUrls
      .map((url) => allImages.find((img) => img.url === url) || { url, variantIds: [] });
    if (byMapping.length > 0) return byMapping as PrintifyImage[];

    // 2) variant id matching
    const variantIds = colorToVariantIds.get(normalize(selectedColor)) || [];
    if (variantIds.length > 0) {
      const byVariantMeta = allImages.filter((img) =>
        (img.variantIds || []).some((id) => variantIds.includes(String(id)))
      );
      if (byVariantMeta.length > 0) return byVariantMeta;

      const byVariant = allImages.filter((img) => variantIds.some((id) => img.url.includes(id)));
      if (byVariant.length > 0) return byVariant;
    }

    // 3) fallback color name heuristic
    const normColor = normalize(selectedColor);
    const matched = allImages.filter((img) => normalize(img.url).includes(normColor));
    return matched.length > 0 ? matched : allImages;
  })();

  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [displayImages.length, selectedColor]);

  const featured = displayImages[index] || allImages?.[0];
  const thumbs = displayImages.length ? displayImages : allImages;

  return (
    <div className="space-y-4">
      {featured && (
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
          <Image src={featured.url} alt={product.title} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 90vw" priority />
        </div>
      )}
      {thumbs.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {thumbs.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setIndex(idx)}
              className={`relative aspect-square overflow-hidden rounded-lg border ${idx === index ? 'border-green' : 'border-black/5'}`}
            >
              <Image src={img.url} alt={`${product.title} - ${idx + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
