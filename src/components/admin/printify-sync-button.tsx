'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PrintifySyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/printify/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Sync failed');
      }
      setMessage(
        `Synced: ${data.imported || 0} created, ${data.updated || 0} updated (requests: ${data.requestsUsed || 0})`
      );
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to sync products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-green hover:border-green/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Syncing…' : 'Sync from Printify'}
      </button>
      {message && <span className="text-xs text-black/70">{message}</span>}
    </div>
  );
}
