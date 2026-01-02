"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" }
];

export function Header() {
  const items = useCart((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="flex items-center justify-between py-6">
      <Link href="/" className="font-semibold tracking-wide uppercase text-sm">
        low key high
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition hover:text-forest"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/cart"
          className={cn(
            "relative rounded-full border border-ink/10 px-4 py-1 text-sm transition",
            "hover:border-forest hover:text-forest"
          )}
        >
          <span>Bag</span>
          {mounted && (
            <span className="absolute -right-2 -top-2 rounded-full bg-forest px-2 py-0.5 text-xs text-background">
              {count}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
