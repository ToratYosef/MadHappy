'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';

interface StickyPromoBannerProps {
  banner: {
    id: string;
    text?: string;
    link?: string;
    promoCode?: {
      code: string;
      type: 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'TIERED';
      discount: number;
      flatDiscount?: number;
      minOrderAmount?: number;
      maxDiscount?: number;
      maxUses?: number;
      currentUses: number;
      expiresAt?: string;
    };
  };
}

export default function StickyPromoBanner({ banner }: StickyPromoBannerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    // Check if banner was previously minimized
    const minimized = localStorage.getItem(`banner-minimized-${banner.id}`);
    if (minimized === 'true') {
      setIsMinimized(true);
    }
  }, [banner.id]);

  useEffect(() => {
    if (!banner.promoCode?.expiresAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expires = new Date(banner.promoCode.expiresAt!).getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [banner.promoCode?.expiresAt]);

  const handleMinimize = () => {
    localStorage.setItem(`banner-minimized-${banner.id}`, 'true');
    setIsMinimized(true);
  };

  const handleExpand = () => {
    localStorage.setItem(`banner-minimized-${banner.id}`, 'false');
    setIsMinimized(false);
  };

  if (!banner.promoCode) return null;

  // Generate the display text based on promo type
  let promoDisplay = '';
  switch (banner.promoCode.type) {
    case 'PERCENTAGE':
      promoDisplay = `${banner.promoCode.discount}% OFF`;
      if (banner.promoCode.maxDiscount) {
        promoDisplay += ` (up to $${(banner.promoCode.maxDiscount / 100).toFixed(2)})`;
      }
      break;
    case 'FLAT_AMOUNT':
      promoDisplay = `$${((banner.promoCode.flatDiscount || 0) / 100).toFixed(2)} OFF`;
      break;
    case 'FREE_SHIPPING':
      promoDisplay = 'FREE SHIPPING';
      if (banner.promoCode.minOrderAmount) {
        promoDisplay += ` on orders $${(banner.promoCode.minOrderAmount / 100).toFixed(2)}+`;
      }
      break;
    case 'TIERED':
      promoDisplay = 'TIERED SAVINGS';
      break;
  }

  const link = banner.link || '/shop';
  const usesLeft = banner.promoCode.maxUses ? banner.promoCode.maxUses - banner.promoCode.currentUses : null;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="bg-green text-white">
        <div className="relative px-4 py-1.5 text-center">
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
            <span className="font-bold">{promoDisplay}</span>
            <span>•</span>
            <span className="font-mono font-semibold">Code: {banner.promoCode.code}</span>
          </div>
          <button
            onClick={handleExpand}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Expand banner"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-green text-white">
      <Link href={link} className="block">
        <div className="relative px-4 py-2.5 text-center">
          <div className="flex items-center justify-center gap-3 text-sm md:text-base font-medium">
            <span className="font-bold">{promoDisplay}</span>
            {banner.text && <span className="hidden sm:inline">•</span>}
            {banner.text && <span className="hidden sm:inline">{banner.text}</span>}
            <span>•</span>
            <span className="font-mono font-semibold">Code: {banner.promoCode.code}</span>
            {usesLeft !== null && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline font-semibold">{usesLeft} uses left</span>
              </>
            )}
            {timeLeft && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline font-mono">⏱️ {timeLeft}</span>
              </>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleMinimize();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Minimize banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </div>
  );
}
