import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default async function TrackOrderPage() {
  const session = await getAuthSession();

  if (!session?.user?.id || !session.user.email) {
    redirect('/');
  }

  const orders = await prisma.order.findMany({
    where: { customerEmail: session.user.email },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex-1 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Track Order</h1>
            <p className="text-black/70">View the status of your orders.</p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-black/5 bg-white p-6 text-center">
              <p className="text-black/60">You haven&apos;t placed any orders yet.</p>
              <a href="/shop" className="text-green hover:underline mt-2 inline-block">
                Start shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-black/50">Order Number</p>
                      <p className="font-semibold text-lg">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-black/50">Total</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(order.totalCents, order.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-black/50">Status</p>
                      <p className={`font-semibold ${
                        order.paymentStatus === 'PAID' 
                          ? 'text-green' 
                          : order.paymentStatus === 'FAILED'
                          ? 'text-red-600'
                          : 'text-black/70'
                      }`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-black/50">Fulfillment</p>
                      <p className={`font-semibold ${
                        order.fulfillmentStatus === 'DELIVERED' || order.fulfillmentStatus === 'SHIPPED'
                          ? 'text-green' 
                          : 'text-black/70'
                      }`}>
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
                      <p className="text-xs uppercase tracking-[0.1em] text-black/50 mb-3">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              {item.variantTitle && <p className="text-black/60">{item.variantTitle}</p>}
                            </div>
                            <div className="text-right">
                              <p>x {item.qty}</p>
                              <p className="text-black/60">
                                {formatCurrency(item.priceCents * item.qty)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>

                  <div className="border-t border-black/5 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black/70">Subtotal</span>
                      <span>{formatCurrency(order.subtotalCents, order.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black/70">Shipping</span>
                      <span>{formatCurrency(order.shippingCents, order.currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-black/5 pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalCents, order.currency)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-black/50">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
