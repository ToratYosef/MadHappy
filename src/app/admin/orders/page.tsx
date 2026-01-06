import Link from 'next/link';
import { getOrders } from '@/lib/queries/orders';
import { formatCurrency } from '@/lib/utils';
import { DeleteOrderButton } from './delete-order-button';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { page?: string; search?: string };
}

export default async function OrdersPage({ searchParams }: Props) {
  const page = Number(searchParams.page || 1);
  const take = 20;
  const { orders } = await getOrders({ skip: (page - 1) * take, take, search: searchParams.search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-black/60">Track fulfillment and payments.</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="text-left text-black/60">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-green hover:underline">
                    {order.orderNumber || order.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-black/70">{order.customerEmail}</td>
                <td className="px-4 py-3">{formatCurrency(order.totalCents)}</td>
                <td className="px-4 py-3 text-black/70">{order.paymentStatus}</td>
                <td className="px-4 py-3 text-black/70">{order.fulfillmentStatus}</td>
                <td className="px-4 py-3">
                  <DeleteOrderButton orderId={order.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
