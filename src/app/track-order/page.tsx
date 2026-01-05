import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';

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
      <StickyPromoBannerSection />
      <section className="container-max flex-1 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
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

                  {/* Order Items with Images */}
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
                            {item.variantTitle && (
                              <p className="text-xs text-black/60">{item.variantTitle}</p>
                            )}
                            {item.options && typeof item.options === 'object' && (
                              <p className="text-xs text-black/60 mt-1">
                                {Object.entries(item.options as Record<string, any>)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-black/70">Qty: {item.qty}</span>
                              <span className="text-black/70">
                                {formatCurrency(item.priceCents)} each
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold">
                              {formatCurrency(item.priceCents * item.qty)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-black/5 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black/70">Subtotal</span>
                      <span>{formatCurrency(order.subtotalCents, order.currency)}</span>
                    </div>
                    {order.discountCents > 0 && (
                      <div className="flex justify-between text-green">
                        <span>
                          Discount {order.promoCode && `(${order.promoCode})`}
                        </span>
                        <span>-{formatCurrency(order.discountCents, order.currency)}</span>
                      </div>
                    )}
                    {order.taxCents > 0 && (
                      <div className="flex justify-between">
                        <span className="text-black/70">Tax</span>
                        <span>{formatCurrency(order.taxCents, order.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-black/70">Shipping</span>
                      <span>{order.shippingCents > 0 ? formatCurrency(order.shippingCents, order.currency) : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-black/5 pt-2 mt-2">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalCents, order.currency)}</span>
                    </div>
                  </div>

                  {/* Tracking Info */}
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
