
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALLOWED_COLOR_NAMES, isColorOption } from '@/app/product/[slug]/parts/selection-helpers';
import type { ProductOption, ProductVariant } from '@/types/product';

type Product = {
  id: string;
  title: string;
  description: string;
  slug: string;
  options: ProductOption[];
  variants: ProductVariant[];
};

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', '2XL'];

export function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [slug, setSlug] = useState(product.slug);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const initialColors = useMemo(() => {
    const colorOption = product.options?.find((opt) => isColorOption(opt.name));
    if (colorOption?.values?.length) return colorOption.values;

    const colorsFromVariants = product.variants
      .map((v) =>
        Object.entries(v.options || {}).find(([key]) => isColorOption(key))?.[1] || ''
      )
      .filter(Boolean) as string[];
    return Array.from(new Set(colorsFromVariants));
  }, [product.options, product.variants]);

  const initialSizes = useMemo(() => {
    const sizeOption = product.options?.find((opt) => /size/i.test(opt.name));
    if (sizeOption?.values?.length) return sizeOption.values.filter((v) => SIZE_OPTIONS.includes(v));

    const sizesFromVariants = product.variants
      .map((v) => Object.entries(v.options || {}).find(([key]) => /size/i.test(key))?.[1] || '')
      .filter(Boolean) as string[];
    const normalized = Array.from(new Set(sizesFromVariants)).filter((v) => SIZE_OPTIONS.includes(v));
    return normalized.length ? normalized : SIZE_OPTIONS;
  }, [product.options, product.variants]);

  const [colorsText, setColorsText] = useState<string>(initialColors.join('\n'));
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const colors = colorsText.split('\n').map(c => c.trim()).filter(Boolean);
      if (!colors.length) {
        throw new Error('Enter at least one color');
      }
      if (!selectedSizes.length) {
        throw new Error('Select at least one size');
      }
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, slug, colors, sizes: selectedSizes })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update product');
      }

      router.push(`/admin/products/${product.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (value: string, current: string[], setter: (next: string[]) => void) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft">
      <div>
        <label className="text-sm font-semibold text-black/70" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-black/70" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2"
          required
        />
        <p className="mt-1 text-xs text-black/50">Must be unique; shown on the storefront.</p>
      </div>
      <div>
        <label className="text-sm font-semibold text-black/70" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2"
          rows={6}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-black/70" htmlFor="colors">Available colors</label>
          <span className="text-xs text-black/50">One per line</span>
        </div>
        <textarea
          id="colors"
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-sm"
          rows={8}
          placeholder="White\nIce Grey\nSage\nKelly Green\nHeather Irish Green\nTropical Blue\nJade Dome\nSky\nCarolina Blue\nStone Blue\nHeather Indigo\nAntique Sapphire\nHeather Radiant Orchid\nLight Pink\nHeather Cardinal\nCardinal Red"
        />
        <p className="text-xs text-black/50">Enter each color on a new line. These colors are specific to this product.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-black/70">Available sizes</label>
          <span className="text-xs text-black/50">S - 2XL</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {SIZE_OPTIONS.map((size) => (
            <label key={size} className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                className="h-4 w-4"
              />
              <span>{size}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="button-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm text-black/70 hover:border-black/30"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
