'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { filterImagesByVariant, getFeaturedImage } from '@/lib/printify-images';
import type { PrintifyImage, PrintifyProduct, PrintifyVariant } from '@/types/printify';
import AddToCart from './add-to-cart';
import { getInitialSelections, isColorOption, resolveVariant } from './selection-helpers';

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
    <div className="bg-gradient-to-b from-slate-50/70 to-white">
      <div className="container-max grid items-start gap-10 py-12 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
            {featuredImage?.url ? (
              <Image
                src={featuredImage.url}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 90vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-black/40">No image available</div>
            )}
          </div>
          {variantImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
              {variantImages.map((img) => (
                <button
                  key={`${img.url}-${(img.variantIds || []).join('-')}`}
                  type="button"
                  onClick={() => setFeaturedImage(img)}
                  className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                    featuredImage?.url === img.url ? 'border-green ring-2 ring-green/30' : 'border-black/10'
                  }`}
                >
                  <Image src={img.url} alt={product.title} fill className="object-cover" sizes="160px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-lg shadow-black/5 backdrop-blur">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">Product detail</p>
            <h1 className="text-3xl font-semibold leading-tight">{product.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green/10 px-3 py-1 text-lg font-semibold text-green">
                {formatCurrency(price, 'USD')}
              </span>
              {Object.keys(selections).length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.12em] text-black/50">
                  {Object.entries(selections).map(([k, v]) => (
                    <span key={k} className="rounded-full border border-black/10 px-3 py-1">
                      {isColorOption(k) ? 'Color' : k}: {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-black/5 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-black">Pick your perfect combo</p>
            <p className="text-sm text-black/70">
              Colors stay circles, sizes stay sizes. Only active (enabled) options show up, and selecting a color
              automatically uses the matching mockup so the images stay true to the variant.
            </p>
          </div>

          <p className="text-black/70 leading-relaxed">{product.description}</p>

          <AddToCart
            product={product}
            initialSelections={initialSelections}
            onSelectionChange={setSelections}
            onVariantChange={setActiveVariant}
            selectedImageUrl={featuredImage?.url}
          />
        </div>
      </div>
    </div>
  );
}
