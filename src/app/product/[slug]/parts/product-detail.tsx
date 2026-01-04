'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { filterImagesByVariant, getFeaturedImage } from '@/lib/printify-images';
import type { PrintifyImage, PrintifyProduct, PrintifyVariant } from '@/types/printify';
import AddToCart from './add-to-cart';
import { getInitialSelections, resolveVariant } from './selection-helpers';

interface Props {
  product: PrintifyProduct;
}

export default function ProductDetail({ product }: Props) {
  const initialSelections = useMemo(
    () => getInitialSelections(product.options, product.variants),
    [product.options, product.variants]
  );
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);
  const [activeVariant, setActiveVariant] = useState<PrintifyVariant | null>(() =>
    resolveVariant(product.options, product.variants, initialSelections)
  );

  useEffect(() => {
    setSelections(initialSelections);
    setActiveVariant(resolveVariant(product.options, product.variants, initialSelections));
  }, [initialSelections, product.options, product.variants]);

  const variantImages = useMemo(
    () => filterImagesByVariant(product.images, activeVariant?.variantId),
    [product.images, activeVariant?.variantId]
  );

  const fallbackImage =
    product.images.find((img) => img.isDefault) ?? getFeaturedImage(product.images) ?? null;
  const [featuredImage, setFeaturedImage] = useState<PrintifyImage | null>(
    getFeaturedImage(product.images, activeVariant?.variantId) ?? fallbackImage ?? null
  );

  useEffect(() => {
    const nextFeatured = getFeaturedImage(product.images, activeVariant?.variantId) ?? fallbackImage ?? null;
    setFeaturedImage(nextFeatured);
  }, [product.images, activeVariant?.variantId, fallbackImage]);

  const price = activeVariant?.priceCents ?? product.variants[0]?.priceCents ?? 0;

  return (
    <div className="container-max grid gap-10 py-12 lg:grid-cols-2">
      <div className="space-y-4">
        {featuredImage?.url && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
            <Image
              src={featuredImage.url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 90vw"
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {variantImages.map((img) => (
            <button
              key={`${img.url}-${(img.variantIds || []).join('-')}`}
              type="button"
              onClick={() => setFeaturedImage(img)}
              className={`relative aspect-square overflow-hidden rounded-lg border ${
                featuredImage?.url === img.url ? 'border-green' : 'border-black/5'
              }`}
            >
              <Image src={img.url} alt={product.title} fill className="object-cover" sizes="150px" />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-black/50">Print on demand</p>
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          <p className="text-lg text-black/70">{formatCurrency(price, 'USD')}</p>
          {Object.keys(selections).length > 0 && (
            <p className="text-sm text-black/60">
              {Object.entries(selections)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' · ')}
            </p>
          )}
        </div>
        <p className="text-black/70">{product.description}</p>
        <AddToCart
          product={product}
          initialSelections={initialSelections}
          onSelectionChange={setSelections}
          onVariantChange={setActiveVariant}
          selectedImageUrl={featuredImage?.url}
        />
      </div>
    </div>
  );
}
