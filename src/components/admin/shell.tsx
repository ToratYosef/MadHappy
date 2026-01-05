import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Gauge, Package, Settings, ShoppingCart, LogOut, Ticket, Image as ImageIcon, Users } from 'lucide-react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SignOutButton } from './sign-out-button';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: Gauge },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Ticket },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user?.email) redirect('/login');

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background">
      <aside className="hidden border-r border-black/5 bg-white/70 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-black/5 px-6 py-5 flex items-center justify-center">
            <Image src="/logo.png" alt="Low Key High" width={150} height={50} className="h-14 w-auto" priority />
          </div>
          <nav className="flex-1 space-y-1 p-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-black/70 transition hover:bg-black/5',
                  item.href === '/' && 'text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-black/5 p-3">
            <SignOutButton>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/70 hover:bg-black/5">
                <LogOut className="h-4 w-4" /> Sign out
              </div>
            </SignOutButton>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-black/5 bg-white/70 px-4 py-3 shadow-sm lg:hidden">
          <div className="text-base font-semibold">low key high admin</div>
          <SignOutButton>
            <span className="text-sm text-black/70">Sign out</span>
          </SignOutButton>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
