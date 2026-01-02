import Link from 'next/link';
import AnimatedSection from '@/components/ui/animated-section';

export function Hero({ settings }: { settings: { heroHeadline?: string | null; heroSubheadline?: string | null } }) {
  return (
    <AnimatedSection className="container-max flex flex-col gap-6 py-16 md:flex-row md:items-center md:gap-10">
      <div className="flex-1 space-y-4">
        <p className="inline-flex rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
          low key high
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          {settings.heroHeadline || 'Understated layers built for movement.'}
        </h1>
        <p className="max-w-2xl text-lg text-black/70">
          {settings.heroSubheadline ||
            'Thoughtful fabrics, minimal forms, premium feel. Elevate the everyday.'}
        </p>
        <div className="flex flex-wrap gap-3 pt-3">
          <Link href="/shop" className="button-primary">
            Shop collection
          </Link>
          <Link href="#featured" className="button-secondary">
            Featured pieces
          </Link>
        </div>
      </div>
      <div className="flex-1">
        <div className="card h-full min-h-[320px] bg-gradient-to-br from-taupe/30 via-white to-green/10" />
      </div>
    </AnimatedSection>
  );
}
