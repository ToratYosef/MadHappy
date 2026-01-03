'use client';

import Image from 'next/image';
import type { PrintifyImage, PrintifyProduct } from '@/types/printify';

interface Variant {
  variantId: string;
  title: string;
  priceCents: number;
  options: Record<string, string>;
}

interface Product {
  title: string;
  images: PrintifyImage[] | string[];
  variants: Variant[];
}

interface ProductGalleryProps {
  product: Product | PrintifyProduct;
  selectedOptions: Record<string, string>;
}

export default function ProductGallery({ product, selectedOptions }: ProductGalleryProps) {
  // Show all product images (Printify doesn't provide per-variant image mapping)
  // In the future, this could be enhanced if Printify API adds variant-specific images
  const displayImages = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? { url: img } : img as PrintifyImage)).filter((img) => !!img.url)
    : [];
  const featuredImage = displayImages[0];
  const thumbnails = displayImages.slice(1);

  return (
    <div className="space-y-4">
      {featuredImage?.url && (
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
          <Image
            src={featuredImage.url}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 90vw"
            priority
          />
        </div>
      )}
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {thumbnails.map((img, idx) => (
            <div key={`${img.url}-${idx}`} className="relative aspect-square overflow-hidden rounded-lg border border-black/5">
              <Image 
                src={img.url} 
                alt={`${product.title} - Image ${idx + 2}`} 
                fill 
                className="object-cover" 
                sizes="150px" 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
