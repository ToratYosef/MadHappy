import Link from 'next/link';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/animated-section';

const heroImages = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80&sat=-10',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80&sat=-10',
  'https://images.unsplash.com/photo-1509635022432-0226a97f5aa7?auto=format&fit=crop&w=900&q=80&sat=-10'
];

export function Hero({ settings }: { settings: { heroHeadline?: string | null; heroSubheadline?: string | null } }) {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50/50 to-white">
      <AnimatedSection className="container-max grid gap-12 py-20 md:grid-cols-[1.05fr_1fr] md:items-center md:py-28">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-2 text-sm font-medium text-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green"></span>
            </span>
            Travel capsule just landed
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            {settings.heroHeadline || 'Travel-ready layers built for takeoff'}
          </h1>
          <p className="max-w-2xl text-xl text-black/70 leading-relaxed">
            {settings.heroSubheadline ||
              'Elevated essentials engineered for red-eyes, layovers, and everything between departure and arrival.'}
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
              <p className="text-2xl font-bold text-green">Made</p>
              <p className="text-black/60">In small batches</p>
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(18,49,43,0.12),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(181,150,69,0.14),transparent_40%)] blur-2xl" />
          <div className="relative grid w-full max-w-xl grid-cols-2 gap-4">
            <div className="relative col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-green/30 via-slate-50 to-taupe/40 shadow-2xl">
              <Image
                src={heroImages[0]}
                alt="LowKeyHigh street look"
                width={900}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={heroImages[1]}
                alt="LowKeyHigh lounge set"
                width={600}
                height={700}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>
            <div className="relative -mt-10 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <Image
                src={heroImages[2]}
                alt="LowKeyHigh detail shot"
                width={600}
                height={700}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
                Earthy tones
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
