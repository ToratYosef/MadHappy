'use client';

import { useCartDrawer } from '@/lib/cart-drawer-store';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const isOpen = useCartDrawer((s) => s.isOpen);
  const close = useCartDrawer((s) => s.close);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const total = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={close}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right-96 duration-300">
        <div className="flex items-center justify-between border-b border-black/5 p-6">
          <h2 className="text-xl font-semibold">Your cart</h2>
          <button
            onClick={close}
            className="rounded-lg p-2 hover:bg-black/5 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center min-h-[400px]">
            <p className="text-black/60">Your cart is empty</p>
            <Link
              href="/shop"
              onClick={close}
              className="text-sm text-green hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 p-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 rounded-lg border border-black/5 p-4 bg-white/50"
                >
                  {item.imageUrl && (
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-black/5">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={close}
                      className="font-medium text-sm hover:text-green transition truncate"
                    >
                      {item.name}
                    </Link>
                    {item.variantTitle && (
                      <p className="text-xs text-black/60 mt-1">{item.variantTitle}</p>
                    )}
                    {item.options && (
                      <p className="text-[11px] text-black/60">
                        {Object.entries(item.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </p>
                    )}
                    <p className="text-sm font-semibold mt-2">
                      {formatCurrency(item.priceCents, 'USD')}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.qty}
                        onChange={(e) =>
                          updateQty(item.variantId, Number(e.target.value))
                        }
                        className="w-12 rounded border border-black/10 px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/5 space-y-4 p-6">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total, 'USD')}</span>
              </div>

              <Link
                href="/cart"
                onClick={close}
                className="button-primary w-full block text-center"
              >
                View full cart
              </Link>

              <button
                onClick={close}
                className="w-full rounded-full border border-black/10 px-6 py-3 text-sm font-medium transition hover:bg-black/5"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
