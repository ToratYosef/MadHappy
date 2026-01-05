import Link from 'next/link';
import AnimatedSection from '@/components/ui/animated-section';

export function Hero({ settings }: { settings: { heroHeadline?: string | null; heroSubheadline?: string | null } }) {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50/50 to-white">
      <AnimatedSection className="container-max flex flex-col gap-8 py-20 md:flex-row md:items-center md:gap-12 md:py-28">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-2 text-sm font-medium text-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green"></span>
            </span>
            New arrivals in stock
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            {settings.heroHeadline || 'Understated layers built for movement'}
          </h1>
          <p className="max-w-xl text-xl text-black/70 leading-relaxed">
            {settings.heroSubheadline ||
              'Premium hoodies and tees designed for comfort. Subtle style that speaks volumes.'}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/shop" className="button-primary text-lg px-8 py-4">
              Shop collection →
            </Link>
            <Link href="#featured" className="button-secondary text-lg px-8 py-4">
              View featured
            </Link>
          </div>
          <div className="flex items-center gap-8 pt-6 text-sm">
            <div>
              <p className="text-2xl font-bold text-green">2000+</p>
              <p className="text-black/60">Happy customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green">4.9/5</p>
              <p className="text-black/60">Average rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green">Free</p>
              <p className="text-black/60">Shipping on $50+</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-green/20 via-slate-100 to-taupe/30 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
