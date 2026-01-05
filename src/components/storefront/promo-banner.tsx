'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PromoBannerProps {
  banner: {
    id: string;
    title: string;
    text?: string;
    imageUrl: string;
    link?: string;
    promoCode?: {
      id: string;
      code: string;
      type: 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'TIERED';
      discount: number;
      flatDiscount?: number;
      minOrderAmount?: number;
      freeShipping: boolean;
      maxDiscount?: number;
      maxUses?: number;
      currentUses: number;
      expiresAt?: string;
    };
  };
}

export default function PromoBanner({ banner }: PromoBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!banner.promoCode?.expiresAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const promoCode = banner.promoCode!;
      const expires = new Date(promoCode.expiresAt!).getTime();
      const difference = expires - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
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

  const link = banner.link || '#';
  const usesLeft = banner.promoCode?.maxUses ? banner.promoCode.maxUses - banner.promoCode.currentUses : undefined;

  return (
    <Link href={link} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Background Image */}
        <div className="relative h-32 md:h-40 lg:h-48 overflow-hidden">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6">
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-white mb-1">{banner.title}</h3>
            {banner.text && <p className="text-sm md:text-base text-white/90">{banner.text}</p>}
          </div>

          {/* Promo Details */}
          {banner.promoCode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Dynamic badge based on promo type */}
                {banner.promoCode.type === 'PERCENTAGE' && (
                  <span className="bg-green text-white px-3 py-1 rounded-full text-sm md:text-base font-semibold">
                    {banner.promoCode.discount}% OFF
                  </span>
                )}
                {banner.promoCode.type === 'FLAT_AMOUNT' && banner.promoCode.flatDiscount && (
                  <span className="bg-green text-white px-3 py-1 rounded-full text-sm md:text-base font-semibold">
                    ${(banner.promoCode.flatDiscount / 100).toFixed(2)} OFF
                  </span>
                )}
                {banner.promoCode.type === 'FREE_SHIPPING' && (
                  <span className="bg-green text-white px-3 py-1 rounded-full text-sm md:text-base font-semibold">
                    FREE SHIPPING
                  </span>
                )}
                {banner.promoCode.type === 'TIERED' && (
                  <span className="bg-green text-white px-3 py-1 rounded-full text-sm md:text-base font-semibold">
                    TIERED SAVINGS
                  </span>
                )}
                
                {/* Show max discount or min order amount for applicable types */}
                {banner.promoCode.maxDiscount && banner.promoCode.type === 'PERCENTAGE' && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded text-xs md:text-sm">
                    Up to ${banner.promoCode.maxDiscount}
                  </span>
                )}
                {banner.promoCode.minOrderAmount && banner.promoCode.minOrderAmount > 0 && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded text-xs md:text-sm">
                    On orders ${(banner.promoCode.minOrderAmount / 100).toFixed(2)}+
                  </span>
                )}
              </div>

              {/* Code Badge */}
              <div className="bg-white/95 backdrop-blur-sm rounded px-3 py-1 inline-block">
                <p className="text-xs md:text-sm font-mono font-semibold text-black">
                  Code: {banner.promoCode.code}
                </p>
              </div>

              {/* Uses Left */}
              {usesLeft !== undefined && usesLeft >= 0 && (
                <div className="text-white text-xs md:text-sm">
                  <span className={usesLeft <= 5 ? 'font-bold text-orange-300' : ''}>
                    {usesLeft === 0 ? '🔴 Sold Out' : `${usesLeft} uses left`}
                  </span>
                </div>
              )}

              {/* Countdown Timer */}
              {banner.promoCode.expiresAt && timeLeft && (
                <div className="bg-black/40 text-white rounded px-3 py-1 inline-block">
                  <p className="text-xs md:text-sm font-mono">
                    ⏱️ {timeLeft === 'Expired' ? '❌ Expired' : `${timeLeft}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
