'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' }
];

export default function Navbar() {
  const pathname = usePathname();
  const count = useCartStore((s) => s.items.reduce((acc, item) => acc + item.qty, 0));
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/70 backdrop-blur">
      <div className="container-max flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          low key high
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-3 py-2 transition hover:bg-black/5',
                pathname === link.href && 'bg-black/5 text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-black/5 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-green px-2 text-xs font-semibold text-white shadow-soft">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
