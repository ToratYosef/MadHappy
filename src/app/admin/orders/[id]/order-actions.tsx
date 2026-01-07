'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderActionsProps {
  orderId: string;
  fulfillmentStatus: string;
  printifyOrderId: string | null;
}

export function OrderActions({ orderId, fulfillmentStatus, printifyOrderId }: OrderActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancellingPrintify, setIsCancellingPrintify] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = !printifyOrderId && fulfillmentStatus !== 'CANCELED' && fulfillmentStatus !== 'CANCELLED';
  const canCancel = fulfillmentStatus === 'DRAFT' || fulfillmentStatus === 'PROCESSING';
  const canCancelPrintify = Boolean(printifyOrderId);

  const handleSubmitToPrintify = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/submit-to-printify`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setSuccess(`Order submitted to Printify! ID: ${data.printifyOrderId}`);
      setTimeout(() => router.refresh(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!canCancel) return;
    
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setSuccess('Order cancelled successfully');
      setTimeout(() => router.refresh(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelPrintify = async () => {
    if (!canCancelPrintify) return;

    if (!confirm('Are you sure you want to cancel this Printify order? This will also mark the order as cancelled.')) {
      return;
    }

    setIsCancellingPrintify(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel-printify`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel Printify order');
      }

      setSuccess('Printify order cancelled and order marked as cancelled');
      setTimeout(() => router.refresh(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancellingPrintify(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {canSubmit && (
          <button
            onClick={handleSubmitToPrintify}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : '📤 Submit to Printify'}
          </button>
        )}

        {printifyOrderId && (
          <div className="rounded-lg border border-black/5 bg-slate-50 p-3 text-sm">
            <p className="text-black/60">Printify Order ID</p>
            <p className="font-mono font-semibold">{printifyOrderId}</p>
          </div>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? 'Cancelling...' : '❌ Cancel Order'}
          </button>
        )}

        {canCancelPrintify && (
          <button
            onClick={handleCancelPrintify}
            disabled={isCancellingPrintify}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancellingPrintify ? 'Cancelling Printify...' : '🛑 Cancel Printify Order'}
          </button>
        )}
      </div>
    </div>
  );
}
