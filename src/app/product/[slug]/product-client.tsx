'use client';

import { useState } from 'react';
import GalleryClient from './gallery-client';
import AddToCart from './parts/add-to-cart';
import type { PrintifyProduct } from '@/types/printify';

export default function ProductClient({ product }: { product: PrintifyProduct }) {
  const initialSelections = Object.fromEntries((product.options || []).map((opt) => [opt.name, opt.values?.[0]]));
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <GalleryClient product={product} selections={selections} />
      <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft h-fit">
        <AddToCart product={product} selections={selections} onChangeSelections={setSelections} />
      </div>
    </div>
  );
}
