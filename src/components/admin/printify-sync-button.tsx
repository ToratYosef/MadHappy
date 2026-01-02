'use client';

import { useState } from 'react';

export function PrintifySyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/printify/sync-products', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync');
      }
      setMessage(`Synced ${data.summary.productsProcessed} products (${data.summary.variantsUpserted} variants)`);
    } catch (error: any) {
      setMessage(error.message || 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleSync} disabled={loading} className="button-primary disabled:opacity-60">
        {loading ? 'Syncing...' : 'Sync Printify products'}
      </button>
      {message && <p className="text-sm text-black/60">{message}</p>}
    </div>
  );
}
