import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default async function AccountPage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex-1 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
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
