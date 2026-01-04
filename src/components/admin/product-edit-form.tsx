'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Product = {
  id: string;
  title: string;
  description: string;
  slug: string;
};

export function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [slug, setSlug] = useState(product.slug);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/printify/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, slug })
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
