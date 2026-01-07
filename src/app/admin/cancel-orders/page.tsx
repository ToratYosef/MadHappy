import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { CancelPrintifyButton } from './cancel-printify-button';

export const dynamic = 'force-dynamic';

export default async function CancelOrdersPage() {
  const orders = await prisma.order.findMany({
    where: {
      printifyOrderId: { not: null },
      fulfillmentStatus: { notIn: ['CANCELLED', 'CANCELED'] }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Cancel Orders</h1>
        <p className="text-sm text-black/60">Cancel Printify orders and mark them cancelled locally.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-left text-black/60">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Printify</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-black/60" colSpan={6}>
                    No active Printify orders found.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-green hover:underline">
                      {order.orderNumber || order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-black/70">{order.customerEmail}</td>
                  <td className="px-4 py-3">{formatCurrency(order.totalCents)}</td>
                  <td className="px-4 py-3 text-black/70">{order.fulfillmentStatus}</td>
                  <td className="px-4 py-3 font-mono text-xs text-black/70">{order.printifyOrderId}</td>
                  <td className="px-4 py-3">
                    <CancelPrintifyButton orderId={order.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
