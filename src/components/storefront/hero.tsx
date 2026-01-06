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
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f6efe2] via-white to-[#e9f3ed]">
      <AnimatedSection className="container-max relative grid gap-12 py-16 md:grid-cols-[1.05fr_1fr] md:items-center md:py-24">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-green shadow-soft ring-1 ring-black/5">
            <span className="h-px w-8 bg-green" />
            MadHappy / Optimism Made Tangible
          </div>
          <h1 className="text-balance text-5xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            {settings.heroHeadline || 'City-ready calm with unapologetic optimism'}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-black/70 md:text-xl">
            {settings.heroSubheadline ||
              'Soft-yet-structured layers built for sunrise walks, airport sprints, and everything in-between. This is the uniform for people who move with good energy.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop" className="button-primary text-lg px-7 py-4">
              Shop the drop →
            </Link>
            <Link href="#featured" className="button-secondary text-lg px-7 py-4">
              Feel the vibe
            </Link>
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green">Community</p>
              <p className="text-lg font-bold text-foreground">2000+ in the loop</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green">Feel</p>
              <p className="text-lg font-bold text-foreground">4.9/5 for comfort</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green">Drop</p>
              <p className="text-lg font-bold text-foreground">Small-batch, intentional</p>
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(18,49,43,0.12),transparent_45%),radial-gradient(circle_at_75%_60%,rgba(181,150,69,0.18),transparent_45%)] blur-2xl" />
          <div className="relative grid w-full max-w-xl grid-cols-2 gap-4">
            <div className="relative col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-green/25 via-slate-50 to-taupe/35 shadow-2xl ring-1 ring-black/5">
              <Image
                src={heroImages[0]}
                alt="Madhappy street look"
                width={900}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
                Launch mood
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              <Image
                src={heroImages[1]}
                alt="Madhappy lounge set"
                width={600}
                height={700}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
            </div>
            <div className="relative -mt-10 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <Image
                src={heroImages[2]}
                alt="Madhappy detail shot"
                width={600}
                height={700}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
                Earthy tones
              </div>
            </div>
            <div className="absolute -right-10 -top-10 hidden h-24 w-24 rounded-full bg-gold/30 blur-3xl md:block" />
            <div className="absolute -left-8 -bottom-12 hidden h-24 w-24 rounded-full bg-green/20 blur-3xl md:block" />
          </div>
          <div className="absolute -right-4 bottom-6 w-48 rotate-[-6deg] rounded-3xl bg-white/90 p-4 text-sm font-semibold text-green shadow-2xl ring-1 ring-black/10 md:right-0">
            Good energy only
            <p className="text-xs font-normal text-black/60">Layered textures. Optimistic palette. Ready for the city.</p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
