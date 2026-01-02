import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

export default async function UserDetailsPage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { id: params.id }
  });

  if (!user) return notFound();

  const orders = user.email
    ? await prisma.order.findMany({
        where: { customerEmail: user.email },
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-green hover:underline text-sm mb-4 inline-block">
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-semibold">{user.name || 'User'}</h1>
        <p className="text-sm text-black/60">{user.email}</p>
      </div>

      {/* User Info */}
      <div className="rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <h2 className="font-semibold text-lg mb-4">Account Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-black/50">Name</p>
            <p className="text-black/90">{user.name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-black/50">Email</p>
            <p className="text-black/90">{user.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-black/50">Joined</p>
            <p className="text-black/90">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-black/50">Total Orders</p>
            <p className="text-black/90">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Orders</h2>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white p-6 text-center text-black/60">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-soft">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Order #</p>
                    <p className="font-semibold">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Total</p>
                    <p className="font-semibold">{formatCurrency(order.totalCents, order.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Status</p>
                    <p className="text-black/90">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Date</p>
                    <p className="text-black/90">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-black/5">
                  <p className="text-xs uppercase tracking-[0.1em] text-black/50 mb-2">Items</p>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm text-black/70">
                        {item.title} (x{item.qty}) - {formatCurrency(item.priceCents * item.qty)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
