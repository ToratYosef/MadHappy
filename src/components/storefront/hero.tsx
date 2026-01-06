'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import AnimatedSection from '@/components/ui/animated-section';

const HERO_IMAGE_SRC = '/assets/woman_nobg.png';

export function Hero({ settings }: { settings: { heroHeadline?: string | null; heroSubheadline?: string | null } }) {
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setImageVisible(true), 60);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-white lg:[height:min(90vh,900px)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fafafa] to-white" aria-hidden />

      <AnimatedSection className="relative z-10 mx-auto w-full max-w-[1260px] px-5 sm:px-8">
        <div className="grid min-h-[420px] grid-cols-12 items-center gap-6 lg:min-h-[min(90vh,900px)] lg:gap-10">
          <div className="col-span-12 lg:col-span-6 space-y-6 pt-12 pb-6 lg:pt-20 lg:pb-12">
            <div className="inline-flex items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-black/60">
              <span className="h-px w-8 bg-black/50" />
              New Arrival
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {settings.heroHeadline || 'City-ready calm with unapologetic optimism'}
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-black/65">
                {settings.heroSubheadline ||
                  'Precision-cut layers that float above the everyday. Intentional proportions, breathable softness, and an airy silhouette that keeps up with you.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/shop" className="button-primary px-7 py-4 text-sm sm:text-base">
                Shop the collection
              </Link>
              <Link href="#featured" className="button-secondary px-7 py-4 text-sm sm:text-base">
                Explore the edit
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 pt-4 text-sm text-black/60">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-green" />
                Free 48-hour dispatch
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-green" />
                Easy returns, premium support
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 relative h-[360px] sm:h-[420px] lg:h-full">
            <div className="absolute inset-y-0 right-[-6%] hidden w-px bg-gradient-to-b from-black/10 via-black/5 to-transparent lg:block" aria-hidden />

            <div className="pointer-events-none relative h-full">
              <div
                className="absolute left-1/2 top-6 w-[78vw] max-w-[440px] -translate-x-1/2 sm:top-4 sm:w-[60vw] lg:left-auto lg:right-0 lg:top-1/2 lg:w-[60%] lg:max-w-[640px] lg:-translate-x-0 lg:-translate-y-[48%]"
                aria-hidden
              >
                <Image
                  src={HERO_IMAGE_SRC}
                  alt="Elevated capsule silhouette"
                  width={1200}
                  height={1600}
                  priority
                  className={`h-auto w-full drop-shadow-[0_20px_50px_rgba(15,15,15,0.08)] transition-all duration-500 ease-out ${
                    imageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
