import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { OrderActions } from './order-actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-black/60">Order</p>
        <h1 className="text-2xl font-semibold">{order.orderNumber || order.id}</h1>
        {order.orderNumber && <p className="text-sm text-black/40 font-mono">{order.id}</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-black/5 p-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-black/60">{item.variantTitle}</p>
                </div>
                <div className="text-right text-sm text-black/70">
                  <p>{formatCurrency(item.priceCents)}</p>
                  <p>Qty {item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-black/5 bg-white p-5 shadow-soft">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-black/60">Status</h3>
                <p className="text-lg font-semibold">{order.paymentStatus}</p>
                <p className="text-sm text-black/60">Fulfillment: {order.fulfillmentStatus}</p>
              </div>
              <div>
                <h3 className="text-sm text-black/60">Customer</h3>
                <p className="font-semibold">{order.shippingName ?? order.customerName ?? 'N/A'}</p>
                <p className="text-sm text-black/60">{order.customerEmail}</p>
                <p className="text-sm text-black/60">
                  {[order.shippingAddress1, order.shippingAddress2, order.shippingCity, order.shippingState, order.shippingPostal, order.shippingCountry]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {order.trackingNumber && (
                  <p className="text-sm text-black/60">
                    Tracking: {order.trackingCarrier} ·{' '}
                    {order.trackingUrl ? (
                      <a href={order.trackingUrl} className="text-green underline" target="_blank">
                        {order.trackingNumber}
                      </a>
                    ) : (
                      order.trackingNumber
                    )}
                  </p>
                )}
              </div>
              <div className="border-t border-black/5 pt-4 text-sm text-black/70">
                <div className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shippingCents)}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-black/5 bg-white p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold text-black/60">Actions</h3>
            <OrderActions 
              orderId={order.id} 
              fulfillmentStatus={order.fulfillmentStatus}
              printifyOrderId={order.printifyOrderId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
