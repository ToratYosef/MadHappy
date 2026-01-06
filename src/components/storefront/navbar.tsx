'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { useCartDrawer } from '@/lib/cart-drawer-store';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' }
];

interface NavbarProps {
  onAuthModalOpen?: () => void;
}

export default function Navbar({ onAuthModalOpen }: NavbarProps = {}) {
  const pathname = usePathname();
  const count = useCartStore((s) => s.items.reduce((acc, item) => acc + item.qty, 0));
  const openDrawer = useCartDrawer((s) => s.open);
  const { data: session } = useSession();
  const { openAuthModal } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScroll, setCanScroll] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  useEffect(() => {
    let ticking = false;
    
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight > 48;
      setCanScroll(scrollable);
      setIsScrolled(scrollable && window.scrollY > 50);
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const doc = document.documentElement;
          const scrollable = doc.scrollHeight - window.innerHeight > 48;
          setCanScroll(scrollable);
          setIsScrolled(scrollable && window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/70 backdrop-blur transition-all duration-300">
      <div className={cn("container-max flex items-center justify-between transition-all duration-300", isScrolled ? "py-2" : "py-4")}
        style={{ minHeight: '72px' }}
      >
        <Link href="/" className="relative flex items-center">
          <Image
            src="/logo.png"
            alt="LowKeyHigh"
            width={220}
            height={80}
            className={cn("w-auto transition-all duration-300", isScrolled ? "h-12" : "h-20")}
            priority 
          />
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
          <button
            onClick={openDrawer}
            className="relative inline-flex items-center gap-2 rounded-full border border-black/5 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-green px-2 text-xs font-semibold text-white shadow-soft">
                {count}
              </span>
            )}
          </button>

          {/* User Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full border border-black/5 px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <User className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-black/5 bg-white shadow-soft">
                {session?.user ? (
                  <div className="space-y-1 p-2">
                    <div className="px-3 py-2 border-b border-black/5">
                      <p className="text-xs text-black/50 uppercase tracking-wider">Signed in as</p>
                      <p className="font-semibold text-sm truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-3 py-2 text-sm hover:bg-black/5 rounded"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/track-order"
                      className="block px-3 py-2 text-sm hover:bg-black/5 rounded"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Track Order
                    </Link>
                    <Link
                      href="/help"
                      className="block px-3 py-2 text-sm hover:bg-black/5 rounded"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Help
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ redirect: true, callbackUrl: '/' });
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    <button
                      onClick={() => {
                        openAuthModal();
                        setIsUserDropdownOpen(false);
                      }}
                      className="button-primary w-full text-sm"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal();
                        setIsUserDropdownOpen(false);
                      }}
                      className="button-secondary w-full text-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
