'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelPrintifyButtonProps {
  orderId: string;
}

export function CancelPrintifyButton({ orderId }: CancelPrintifyButtonProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Cancel this Printify order and mark it cancelled locally?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel-printify`, {
        method: 'POST'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel Printify order');
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isCancelling ? 'Cancelling...' : 'Cancel Printify'}
    </button>
  );
}
