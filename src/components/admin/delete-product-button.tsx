"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function DeleteProductButton({ id, printifyProductId }: { id?: string; printifyProductId?: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this product and its cached variants? This cannot be undone.')) return;
    const res = await fetch('/api/admin/printify-products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, printifyProductId })
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert('Delete failed: ' + (data.error || res.statusText));
    }
  };

  return (
    <button onClick={handleDelete} className="ml-3 rounded bg-red-600 px-3 py-1 text-white text-sm">Delete</button>
  );
}
