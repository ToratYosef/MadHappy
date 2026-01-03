'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PrintifyProduct } from '@/types/printify';

interface ProductCardProps {
  product: PrintifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const imageUrl = typeof image === 'string' ? image : image?.url;
  const price = product.variants[0]?.priceCents ?? 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        whileHover={{ translateY: -6 }}
        className="group overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft"
      >
        {imageUrl && (
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              priority
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-black/50">Print on demand</p>
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-sm text-black/60">{formatCurrency(price, 'USD')}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition group-hover:-translate-y-1 group-hover:text-green">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
