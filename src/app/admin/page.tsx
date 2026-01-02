import { getRecentOrders } from '@/lib/queries/orders';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

async function getMetrics() {
  const [todayRevenue, weekRevenue, unfulfilled, disabledVariants] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, paymentStatus: 'PAID' }
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, paymentStatus: 'PAID' }
    }),
    prisma.order.count({
      where: {
        fulfillmentStatus: { notIn: ['SHIPPED', 'DELIVERED', 'CANCELED'] }
      }
    }),
    prisma.printifyVariantCache.count({ where: { isEnabled: false } })
  ]);

  return {
    todayRevenue: todayRevenue._sum.totalCents || 0,
    weekRevenue: weekRevenue._sum.totalCents || 0,
    unfulfilled,
    disabledVariants
  };
}

export default async function AdminDashboard() {
  const metrics = await getMetrics();
  const recent = await getRecentOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-black/60">Snapshot of store health.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Today" value={formatCurrency(metrics.todayRevenue)} />
        <MetricCard label="Last 7 days" value={formatCurrency(metrics.weekRevenue)} />
        <MetricCard label="Unfulfilled" value={metrics.unfulfilled.toString()} />
        <MetricCard label="Disabled variants" value={metrics.disabledVariants.toString()} />
      </div>
      <div className="rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-black/60">
              <tr>
                <th className="py-2">Order #</th>
                <th className="py-2">Email</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="py-2 font-medium">{order.id}</td>
                  <td className="py-2 text-black/70">{order.customerEmail}</td>
                  <td className="py-2">{formatCurrency(order.totalCents)}</td>
                  <td className="py-2 text-black/70">{order.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-soft">
      <p className="text-sm text-black/60">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
