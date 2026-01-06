'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { filterImagesByVariant, getFeaturedImage } from '@/lib/product-images';
import type { Product, ProductImage, ProductVariant } from '@/types/product';
import { orderProductOptions } from '@/lib/product-options';
import AddToCart from './add-to-cart';
import { getInitialSelections, isColorOption, resolveVariant } from './selection-helpers';
import ImageGalleryModal from '@/components/product/image-gallery-modal';
import ProductCard from '@/components/storefront/product-card';

interface Props {
  product: Product;
}

export default function ProductDetail({ product }: Props) {
  const orderedOptions = useMemo(() => orderProductOptions(Array.isArray(product.options) ? product.options : []), [product.options]);
  const initialSelections = useMemo(
    () => getInitialSelections(orderedOptions, product.variants),
    [orderedOptions, product.variants]
  );

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);
  const activeVariant = useMemo(
    () => resolveVariant(orderedOptions, product.variants, selections),
    [orderedOptions, product.variants, selections]
  );

  const variantImages = useMemo(
    () => filterImagesByVariant(product.images, activeVariant?.id),
    [product.images, activeVariant?.id]
  );

  const fallbackImage =
    product.images.find((img) => img.isDefault) ?? getFeaturedImage(product.images) ?? null;
  const [featuredImage, setFeaturedImage] = useState<ProductImage | null>(
    getFeaturedImage(product.images, activeVariant?.id) ?? fallbackImage ?? null
  );

  useEffect(() => {
    const nextFeatured = getFeaturedImage(product.images, activeVariant?.id) ?? fallbackImage ?? null;
    setFeaturedImage(nextFeatured);
  }, [product.images, activeVariant?.id, fallbackImage]);

  const price = activeVariant?.priceCents ?? product.variants[0]?.priceCents ?? 0;

  const descriptionBlocks = useMemo(() => {
    const raw = String(product.description || '');
    const normalized = raw.replace(/<br\s*\/?>/gi, '\n');
    return normalized
      .split(/\n+/)
      .map((block) => block.trim())
      .filter(Boolean);
  }, [product.description]);

  const initialReviews = useMemo(
    () => [
      {
        id: 'r1',
        author: 'Alex P.',
        rating: 5,
        title: 'Perfect everyday layer',
        body: 'Soft, true-to-size, and the colors pop without looking loud.',
        date: '2 weeks ago'
      },
      {
        id: 'r2',
        author: 'Jordan K.',
        rating: 5,
        title: 'Print holds up',
        body: 'Washed a few times and the print still looks crisp. Hoodie is comfy.',
        date: '1 month ago'
      },
      {
        id: 'r3',
        author: 'Sam R.',
        rating: 4,
        title: 'Great gift',
        body: 'Got the white/XL for my brother—fit is spot on and he wears it constantly.',
        date: '3 months ago'
      }
    ],
    []
  );

  const [reviews, setReviews] = useState(initialReviews);
  const [reviewName, setReviewName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [orderNumber, setOrderNumber] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [validatingOrder, setValidatingOrder] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const soldCount = product.soldCount ?? 1933;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBody.trim()) return;
    if (!orderNumber.trim()) {
      setReviewError('Order number is required');
      return;
    }

    setValidatingOrder(true);
    setReviewError('');

    try {
      const res = await fetch('/api/orders/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), productId: product.id })
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setReviewError(data.message || 'Invalid order number');
        setValidatingOrder(false);
        return;
      }

      const next = {
        id: `user-${Date.now()}`,
        author: reviewName.trim() || 'Verified buyer',
        rating: reviewRating,
        title: reviewTitle.trim() || 'Great quality',
        body: reviewBody.trim(),
        date: 'Just now'
      };
      setReviews((prev) => [next, ...prev]);
      setReviewName('');
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);
      setOrderNumber('');
      setReviewError('');
    } catch (error) {
      setReviewError('Failed to validate order. Please try again.');
    } finally {
      setValidatingOrder(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50/70 to-white">
      <div className="container-max grid items-start gap-10 py-12 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-4 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => {
              if (variantImages.length > 0) {
                const idx = variantImages.findIndex(img => img.url === featuredImage?.url);
                setGalleryStartIndex(idx >= 0 ? idx : 0);
                setIsGalleryOpen(true);
              }
            }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft transition hover:shadow-md cursor-pointer"
          >
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
            {variantImages.length > 0 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                Click to enlarge
              </div>
            )}
          </button>
          {variantImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
              {variantImages.map((img, index) => (
                <button
                  key={`${img.url}-${(img.variantIds || []).join('-')}`}
                  type="button"
                  onClick={() => {
                    setFeaturedImage(img);
                    setGalleryStartIndex(index);
                    setIsGalleryOpen(true);
                  }}
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

          <div className="flex items-center gap-2 text-sm text-black/60">
            <span className="font-semibold">{soldCount.toLocaleString()}</span>
            <span>sold</span>
          </div>

          {/* Removed helper copy above options per request */}

          <AddToCart
            product={product}
            initialSelections={initialSelections}
            onSelectionChange={setSelections}
            onVariantChange={() => {}}
            selectedImageUrl={featuredImage?.url}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-black">Description</h3>
            <div className="prose prose-sm max-w-none text-black/70 prose-p:mb-3 prose-p:leading-relaxed">
              {descriptionBlocks.map((block, idx) => (
                <p key={idx}>{block}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-max py-8 border-t border-black/5">
        <div className="max-w-3xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Customer Reviews</h2>
            <p className="text-xs text-black/50">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>

          <details className="group mb-4">
            <summary className="cursor-pointer rounded-lg border border-black/5 bg-white p-4 text-sm font-medium hover:bg-slate-50/50 transition">
              Write a review
              <span className="ml-2 text-xs text-black/50">Verified purchases only</span>
            </summary>
            <form onSubmit={submitReview} className="mt-3 space-y-3 rounded-lg border border-black/5 bg-white p-4 shadow-sm">
              {reviewError && (
                <div className="rounded bg-red-50 p-2 text-xs text-red-900">
                  {reviewError}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-black/70" htmlFor="orderNumber">
                    Order number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="mt-1 w-full rounded border border-black/10 px-2 py-1.5 text-xs"
                    placeholder="Order ID"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-black/70" htmlFor="reviewRating">
                    Rating
                  </label>
                  <select
                    id="reviewRating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-black/10 px-2 py-1.5 text-xs"
                  >
                    <option value={5}>★★★★★</option>
                    <option value={4}>★★★★☆</option>
                    <option value={3}>★★★☆☆</option>
                    <option value={2}>★★☆☆☆</option>
                    <option value={1}>★☆☆☆☆</option>
                  </select>
                </div>
              </div>
              <input
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full rounded border border-black/10 px-2 py-1.5 text-xs"
                placeholder="Your name (optional)"
              />
              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                className="w-full rounded border border-black/10 px-2 py-1.5 text-xs"
                rows={3}
                placeholder="Share your thoughts..."
                required
              />
              <button type="submit" className="rounded-full bg-green px-4 py-2 text-xs font-semibold text-white hover:bg-green/90 transition" disabled={validatingOrder}>
                {validatingOrder ? 'Validating...' : 'Submit'}
              </button>
            </form>
          </details>

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-black/5 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-black">{review.author}</p>
                    <p className="text-[10px] text-black/40">{review.date}</p>
                  </div>
                  <div className="flex text-xs text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                {review.title && <p className="mt-2 text-xs font-medium text-black">{review.title}</p>}
                <p className="mt-1 text-xs text-black/60 leading-relaxed">{review.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isGalleryOpen && variantImages.length > 0 && (
        <ImageGalleryModal
          images={variantImages}
          initialIndex={galleryStartIndex}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
}
