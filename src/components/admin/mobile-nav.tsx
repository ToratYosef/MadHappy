'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, type LucideIcon } from 'lucide-react';
import { SignOutButton } from './sign-out-button';
import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; icon: LucideIcon };

export function MobileAdminNav({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black/70 shadow-soft"
        aria-label="Open admin navigation"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[80%] transform border-r border-black/5 bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile admin navigation"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <span className="text-sm font-semibold">Admin menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-black/60 hover:bg-black/5"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-black/70 transition hover:bg-black/5"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-black/5 p-3">
          <SignOutButton>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/70 hover:bg-black/5">
              Sign out
            </div>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
