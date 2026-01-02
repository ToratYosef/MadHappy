'use client';

import Image from 'next/image';

interface Variant {
  variantId: string;
  title: string;
  priceCents: number;
  options: Record<string, string>;
}

interface Product {
  title: string;
  images: string[];
  variants: Variant[];
}

interface ProductGalleryProps {
  product: Product;
  selectedOptions: Record<string, string>;
}

export default function ProductGallery({ product, selectedOptions }: ProductGalleryProps) {
  // Show all product images (Printify doesn't provide per-variant image mapping)
  // In the future, this could be enhanced if Printify API adds variant-specific images
  const displayImages = product.images;
  const featuredImage = displayImages[0];
  const thumbnails = displayImages.slice(1);

  return (
    <div className="space-y-4">
      {featuredImage && (
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
          <Image
            src={featuredImage}
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
            <div key={`${img}-${idx}`} className="relative aspect-square overflow-hidden rounded-lg border border-black/5">
              <Image 
                src={img} 
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
