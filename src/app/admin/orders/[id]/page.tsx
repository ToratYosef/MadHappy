import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

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
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-black/5 p-3">
                <div>
                  <p className="font-semibold">{item.nameSnapshot}</p>
                  <p className="text-sm text-black/60">Size {item.size ?? 'N/A'}</p>
                </div>
                <div className="text-right text-sm text-black/70">
                  <p>{formatCurrency(item.priceCentsSnapshot)}</p>
                  <p>Qty {item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 shadow-soft">
          <div>
            <h3 className="text-sm text-black/60">Status</h3>
            <p className="text-lg font-semibold">{order.status}</p>
            <p className="text-sm text-black/60">Fulfillment: {order.fulfillmentStatus}</p>
          </div>
          <div>
            <h3 className="text-sm text-black/60">Customer</h3>
            <p className="font-semibold">{order.shippingName ?? 'N/A'}</p>
            <p className="text-sm text-black/60">{order.email}</p>
            <p className="text-sm text-black/60">
              {[order.shippingAddress1, order.shippingAddress2, order.shippingCity, order.shippingState, order.shippingPostal, order.shippingCountry]
                .filter(Boolean)
                .join(', ')}
            </p>
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
    </div>
  );
}
