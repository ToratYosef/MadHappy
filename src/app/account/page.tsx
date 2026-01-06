import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/storefront/navbar';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
import Footer from '@/components/storefront/footer';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect('/');
  }

  // Get recent orders for this user
  const orders = await prisma.order.findMany({
    where: { customerEmail: session.user.email },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 3 // Show last 3 orders
  });

  // Get user's saved shipping info
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { shippingInfo: true }
  });

  const shippingInfo = (user?.shippingInfo as any) || {};
  const hasShippingInfo = shippingInfo && Object.keys(shippingInfo).length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <StickyPromoBannerSection />
      <section className="container-max flex-1 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">My Account</h1>
            <p className="text-black/70">Manage your account information and preferences.</p>
          </div>

          {/* Account Info */}
          <div className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4">
            <h2 className="text-xl font-semibold">Account Information</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-black/50">Name</p>
                <p className="text-lg text-black/90">{session.user.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-black/50">Email</p>
                <p className="text-lg text-black/90">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Saved Shipping Information */}
          {hasShippingInfo && (
            <div className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4">
              <h2 className="text-xl font-semibold">Saved Shipping Information</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {shippingInfo.name && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Name</p>
                    <p className="text-lg text-black/90">{shippingInfo.name}</p>
                  </div>
                )}
                {shippingInfo.phone && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Phone</p>
                    <p className="text-lg text-black/90">{shippingInfo.phone}</p>
                  </div>
                )}
                {shippingInfo.address1 && (
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.1em] text-black/50">Address</p>
                    <p className="text-lg text-black/90">
                      {shippingInfo.address1}
                      {shippingInfo.address2 && <><br />{shippingInfo.address2}</>}
                      {shippingInfo.city && <><br />{shippingInfo.city}{shippingInfo.state && `, ${shippingInfo.state}`} {shippingInfo.postal}</>}
                      {shippingInfo.country && <><br />{shippingInfo.country}</>}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-black/50 mt-4">
                This information will be automatically filled when you checkout. You can update it during your next order.
              </p>
            </div>
          )}

          {/* My Orders Section */}
          {orders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Orders</h2>
                <Link href="/track-order" className="text-green hover:underline text-sm">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-black/5 bg-white p-5 shadow-soft hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-black/50">Order {order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="text-sm text-black/60 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          <p className="text-xs text-black/50">Subtotal: {formatCurrency(order.subtotalCents)}</p>
                          {order.taxCents > 0 && (
                            <p className="text-xs text-black/50">Tax: {formatCurrency(order.taxCents)}</p>
                          )}
                          <p className="font-semibold text-lg mt-2">{formatCurrency(order.totalCents)}</p>
                        </div>
                        <p className={`text-xs font-semibold mt-2 ${
                          order.paymentStatus === 'PAID' ? 'text-green' : 
                          order.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-black/70'
                        }`}>
                          {order.paymentStatus}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex-shrink-0">
                          {item.imageUrl ? (
                            <div className="relative h-16 w-16 rounded-lg border border-black/5 overflow-hidden">
                              <Image 
                                src={item.imageUrl} 
                                alt={item.title || 'Product'} 
                                fill 
                                className="object-cover" 
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-16 rounded-lg border border-black/5 bg-black/5 flex items-center justify-center">
                              <span className="text-xs text-black/40">No image</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex-shrink-0 h-16 w-16 rounded-lg border border-black/5 bg-black/5 flex items-center justify-center">
                          <span className="text-xs font-semibold text-black/60">+{order.items.length - 4}</span>
                        </div>
                      )}
                    </div>

                    {/* Status and Action */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black/50">Status:</span>
                        <span className={`text-xs font-semibold ${
                          order.fulfillmentStatus === 'DELIVERED' || order.fulfillmentStatus === 'SHIPPED'
                            ? 'text-green' 
                            : 'text-black/70'
                        }`}>
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <Link 
                        href="/track-order" 
                        className="text-sm text-green hover:underline font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {orders.length >= 3 && (
                <Link 
                  href="/track-order" 
                  className="block text-center py-3 rounded-lg border border-black/10 hover:bg-black/5 transition text-sm font-medium"
                >
                  View All Orders
                </Link>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/track-order"
              className="rounded-xl border border-black/5 bg-white p-6 shadow-soft hover:shadow-lg transition text-center"
            >
              <h3 className="font-semibold mb-2">Track Order</h3>
              <p className="text-sm text-black/60">Check the status of your orders</p>
            </Link>
            <Link
              href="/help"
              className="rounded-xl border border-black/5 bg-white p-6 shadow-soft hover:shadow-lg transition text-center"
            >
              <h3 className="font-semibold mb-2">Help & Support</h3>
              <p className="text-sm text-black/60">Get help with your questions</p>
            </Link>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Sign Out</h2>
            <form
              action={async () => {
                'use server';
                await signOut({ redirect: true, callbackUrl: '/' });
              }}
            >
              <button type="submit" className="text-red-600 hover:text-red-700 font-semibold">
                Sign out of your account
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
