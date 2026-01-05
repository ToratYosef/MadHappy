'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types/product';
import { filterImagesByVariant } from '@/lib/product-images';
import { useCartStore } from '@/lib/cart-store';

// Map color names to actual CSS colors for swatches
// This is a fallback map for common color names, but any color the admin enters will be used
const COLOR_MAP: Record<string, string> = {
  'White': '#FFFFFF',
  'Ice Grey': '#D3D3D3',
  'Sage': '#9CAF88',
  'Kelly Green': '#4CBB17',
  'Heather Irish Green': '#5FAD56',
  'Tropical Blue': '#00B4D8',
  'Jade Dome': '#00A86B',
  'Sky': '#87CEEB',
  'Carolina Blue': '#56A0D3',
  'Stone Blue': '#5B7C99',
  'Heather Indigo': '#4F69C6',
  'Antique Sapphire': '#2E5090',
  'Heather Radiant Orchid': '#B565A7',
  'Light Pink': '#FFB6C1',
  'Heather Cardinal': '#9B2D30',
  'Cardinal Red': '#C41E3A',
  'Sport Grey': '#9B9B9B',
  'Military Green': '#4B5320',
  'Irish Green': '#009A49',
  'Light Blue': '#ADD8E6',
  'Indigo Blue': '#4B0082',
  'Royal': '#0038A8',
  'Orchid': '#DA70D6',
  'Azalea': '#F19CBB',
  'Antique Cherry Red': '#982649',
  'Black': '#000000',
  'Navy': '#000080',
  'Red': '#FF0000',
  'Green': '#008000',
  'Blue': '#0000FF',
  'Yellow': '#FFFF00',
  'Orange': '#FFA500',
  'Purple': '#800080',
  'Pink': '#FFC0CB',
  'Brown': '#A52A2A',
  'Grey': '#808080',
  'Gray': '#808080',
  'Beige': '#F5F5DC'
};

const getColorHex = (colorName: string): string => {
  // Check if it's in our map
  if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];
  
  // Check case-insensitive
  const lowerName = colorName.toLowerCase();
  const match = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === lowerName);
  if (match) return COLOR_MAP[match];
  
  // If it looks like a hex color, use it directly
  if (/^#[0-9A-F]{6}$/i.test(colorName)) return colorName;
  
  // Try to use the color name directly (CSS will handle common names like 'red', 'blue', etc.)
  return colorName.toLowerCase().replace(/\s+/g, '');
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

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

  return (
    <motion.div
      whileHover={{ translateY: -6 }}
      className="group overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft"
    >
      <Link href={`/product/${product.slug}`} className="block">
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
                onClick={() => selectColor(value)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition hover:scale-110",
                  selectedColor === value ? "border-black/60 ring-2 ring-black/20 ring-offset-1" : "border-black/10"
                )}
                style={{ backgroundColor: getColorHex(value) }}
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
            onClick={handleQuickAdd}
            disabled={!selectedVariant || (sizeOption && !selectedSize)}
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
