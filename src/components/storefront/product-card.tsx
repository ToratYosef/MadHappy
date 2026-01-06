'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, Check } from 'lucide-react';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { filterImagesByVariant } from '@/lib/product-images';
import { useCartStore } from '@/lib/cart-store';
import { resolveSwatchColor } from '@/lib/color-swatches';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const colorOption = useMemo(
    () => product.options.find((o) => o.name.toLowerCase().includes('color')),
    [product.options]
  );

  const sizeOption = useMemo(
    () => product.options.find((o) => /size/i.test(o.name)),
    [product.options]
  );

  const firstEnabledVariant = useMemo(
    () => product.variants.find((v) => v.isEnabled) ?? product.variants[0],
    [product.variants]
  );

  const colorValues = useMemo(() => {
    if (colorOption) {
      // Get unique colors from this product's variants
      // These are the exact colors the admin configured for THIS product
      const values = product.variants
        .map((v) => v.options?.[colorOption.name])
        .filter(Boolean) as string[];
      return Array.from(new Set(values));
    }
    return [];
  }, [product.variants, colorOption]);

  const [selectedColor, setSelectedColor] = useState<string | null>(colorValues[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addSuccess, setAddSuccess] = useState(false);

  // Get variant for the selected color (any size) to show color-specific images
  const colorVariant = useMemo(() => {
    if (!selectedColor || !colorOption) return firstEnabledVariant;
    return product.variants.find((v) => v.options?.[colorOption.name] === selectedColor) ?? firstEnabledVariant;
  }, [product.variants, colorOption, selectedColor, firstEnabledVariant]);

  const sizesForSelectedColor = useMemo(() => {
    if (!sizeOption) return [];
    const filtered = product.variants.filter((v) => {
      if (selectedColor && colorOption) {
        return v.options?.[colorOption.name] === selectedColor;
      }
      return true;
    });
    const values = filtered
      .map((v) => v.options?.[sizeOption.name])
      .filter(Boolean) as string[];
    return Array.from(new Set(values));
  }, [product.variants, colorOption, sizeOption, selectedColor]);

  const selectedVariant = useMemo(() => {
    const match = product.variants.find((v) => {
      const colorOk = selectedColor && colorOption ? v.options?.[colorOption.name] === selectedColor : true;
      const sizeOk = sizeOption ? selectedSize && v.options?.[sizeOption.name] === selectedSize : true;
      return colorOk && sizeOk;
    });
    if (match) return match;
    return firstEnabledVariant ?? null;
  }, [product.variants, colorOption, sizeOption, selectedColor, selectedSize, firstEnabledVariant]);

  const [isHovering, setIsHovering] = useState(false);

  // Use colorVariant for images so they change with color selection
  const variantImages = useMemo(
    () => (colorVariant ? filterImagesByVariant(product.images, colorVariant.id) : product.images),
    [product.images, colorVariant]
  );

  const baseImage = variantImages[0]?.url ?? product.images?.[0]?.url;
  const hoverImage = variantImages[1]?.url ?? product.images?.[1]?.url ?? baseImage;
  const price = selectedVariant?.priceCents ?? product.variants[0]?.priceCents ?? 0;

  const selectColor = (value: string) => {
    setSelectedColor(value);
    setSelectedSize('');
  };

  const selectSize = (value: string) => {
    setSelectedSize(value);
  };

  const handleQuickAdd = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.title,
      slug: product.slug,
      priceCents: selectedVariant.priceCents,
      imageUrl: baseImage,
      variantTitle: selectedVariant.title,
      options: selectedVariant.options,
      qty: 1
    });
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
  };

  const navigateToProduct = () => {
    router.push(`/product/${product.slug}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToProduct();
    }
  };

  return (
    <motion.div
      whileHover={{ translateY: -6 }}
      className="group overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={navigateToProduct}
      onKeyDown={handleCardKeyDown}
    >
      <Link href={`/product/${product.slug}`} className="block" onClick={(e) => e.stopPropagation()}>
        {baseImage && (
          <div 
            className="relative aspect-[4/5] overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Image
              src={isHovering ? hoverImage : baseImage}
              alt={product.title}
              fill
              priority
              className="object-cover transition duration-500"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent opacity-0 transition" style={{ opacity: isHovering ? 1 : 0 }} />
          </div>
        )}
      </Link>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-black/50">In-house product</p>
            <h3 className="font-semibold leading-tight">{product.title}</h3>
            <p className="text-sm text-black/60">{formatCurrency(price, 'USD')}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition group-hover:-translate-y-1 group-hover:text-green">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        {colorValues.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {colorValues.map((value) => (
              <button
                key={value}
                onClick={(event) => {
                  event.stopPropagation();
                  selectColor(value);
                }}
                onKeyDown={(event) => event.stopPropagation()}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition hover:scale-110",
                  selectedColor === value ? "border-black/60 ring-2 ring-black/20 ring-offset-1" : "border-black/10"
                )}
                style={{ backgroundColor: resolveSwatchColor(value) }}
                title={value}
                aria-label={`Color ${value}`}
              />
            ))}
          </div>
        )}

        {sizeOption && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-black/60">Size</label>
            <select
              className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              value={selectedSize}
              onChange={(e) => selectSize(e.target.value)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <option value="">Select size</option>
              {sizesForSelectedColor.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-slate-50/80 px-3 py-2 opacity-0 transition group-hover:opacity-100">
          <span className="text-sm font-semibold">Quick add</span>
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleQuickAdd();
            }}
            disabled={!selectedVariant || (sizeOption && !selectedSize)}
            onKeyDown={(event) => event.stopPropagation()}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-soft transition-all duration-300 overflow-hidden",
              addSuccess
                ? "border-2 border-black text-black"
                : (!selectedVariant || (sizeOption && !selectedSize))
                ? "bg-green/40 cursor-not-allowed text-white"
                : "bg-green hover:-translate-y-0.5 hover:shadow-lg text-white"
            )}
          >
            {/* White fill animation */}
            <span 
              className={cn(
                "absolute inset-0 bg-white transition-transform duration-500 ease-out",
                addSuccess ? "scale-x-100" : "scale-x-0"
              )}
              style={{ transformOrigin: 'center' }}
            />
            
            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {addSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
