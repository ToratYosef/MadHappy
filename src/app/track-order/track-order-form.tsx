'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

const currencyOrDefault = (value?: string | null) => value || 'USD';

type TrackOrderItem = {
  id: string;
  title: string | null;
  variantTitle: string | null;
  imageUrl: string | null;
  options: Record<string, unknown> | null;
  qty: number;
  priceCents: number;
};

type TrackOrderResponse = {
  id: string;
  orderNumber: string | null;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  currency: string | null;
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  createdAt: string;
  items: TrackOrderItem[];
};

export default function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<TrackOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError('Please enter your order number.');
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: trimmed })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'We could not find that order.');
      }

      const data = (await response.json()) as TrackOrderResponse;
      setOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch order details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Order number</span>
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="LKH-1024"
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Track order'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-4">
          <div className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-black/50">Order Number</p>
                <p className="font-semibold text-lg">{order.orderNumber || order.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-black/50">Total</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(order.totalCents, currencyOrDefault(order.currency))}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-black/50">Status</p>
                <p
                  className={`font-semibold ${
                    order.paymentStatus === 'PAID'
                      ? 'text-green'
                      : order.paymentStatus === 'FAILED'
                        ? 'text-red-600'
                        : 'text-black/70'
                  }`}
                >
                  {order.paymentStatus}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-black/50">Fulfillment</p>
                <p
                  className={`font-semibold ${
                    order.fulfillmentStatus === 'DELIVERED' || order.fulfillmentStatus === 'SHIPPED'
                      ? 'text-green'
                      : 'text-black/70'
                  }`}
                >
                  {order.fulfillmentStatus}
                </p>
              </div>
            </div>

            {order.shippingAddress1 && (
              <div className="border-t border-black/5 pt-4">
                <p className="text-xs uppercase tracking-[0.1em] text-black/50 mb-2">Shipping Address</p>
                <p className="text-black/90">
                  {order.shippingAddress1}
                  {order.shippingAddress2 && <>, {order.shippingAddress2}</>}
                </p>
                <p className="text-black/90">
                  {order.shippingCity}, {order.shippingState} {order.shippingPostal}
                </p>
                <p className="text-black/90">{order.shippingCountry}</p>
              </div>
            )}

            <div className="border-t border-black/5 pt-4">
              <p className="text-xs uppercase tracking-[0.1em] text-black/50 mb-3">Order Items</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    {item.imageUrl && (
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-black/5">
                        <Image
                          src={item.imageUrl}
                          alt={item.title || 'Product'}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.title}</p>
                      {item.variantTitle && <p className="text-xs text-black/60">{item.variantTitle}</p>}
                      {item.options && typeof item.options === 'object' && (
                        <p className="text-xs text-black/60 mt-1">
                          {Object.entries(item.options)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-black/70">Qty: {item.qty}</span>
                        <span className="text-black/70">{formatCurrency(item.priceCents)} each</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">{formatCurrency(item.priceCents * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black/5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black/70">Subtotal</span>
                <span>{formatCurrency(order.subtotalCents, currencyOrDefault(order.currency))}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-green">
                  <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                  <span>-{formatCurrency(order.discountCents, currencyOrDefault(order.currency))}</span>
                </div>
              )}
              {order.taxCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-black/70">Tax</span>
                  <span>{formatCurrency(order.taxCents, currencyOrDefault(order.currency))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-black/70">Shipping</span>
                <span>
                  {order.shippingCents > 0
                    ? formatCurrency(order.shippingCents, currencyOrDefault(order.currency))
                    : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-black/5 pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(order.totalCents, currencyOrDefault(order.currency))}</span>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="border-t border-black/5 pt-4">
                <p className="text-xs uppercase tracking-[0.1em] text-black/50 mb-2">Tracking Information</p>
                <div className="space-y-1">
                  {order.trackingCarrier && (
                    <p className="text-sm">
                      <span className="text-black/70">Carrier:</span> {order.trackingCarrier}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="text-black/70">Tracking Number:</span> {order.trackingNumber}
                  </p>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green hover:underline text-sm inline-block mt-1"
                    >
                      Track Shipment →
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-black/50">Ordered on {new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
