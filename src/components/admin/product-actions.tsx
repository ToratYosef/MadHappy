'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this product from the cache?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/printify/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete product');
      }
      router.refresh();
    } catch (error: any) {
      alert(error?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/70 hover:border-black/30"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:border-red-400"
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
