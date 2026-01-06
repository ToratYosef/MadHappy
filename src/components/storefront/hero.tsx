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
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f2e9da] via-[#f8f5ef] to-[#e6f1ea]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_20%_20%,rgba(18,49,43,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(181,150,69,0.2),transparent_35%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(18,49,43,0.04)_0,transparent_35%,rgba(181,150,69,0.06)_70%,transparent_100%)]" />
      <AnimatedSection className="container-max relative grid gap-14 py-20 md:grid-cols-[1.05fr_1fr] md:items-center md:py-28">
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-green">
            <span className="h-px w-12 bg-green" />
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-soft ring-1 ring-black/5">MadHappy — The Optimism Company</span>
          </div>
          <h1 className="text-balance text-5xl font-black leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            {settings.heroHeadline || 'City-ready calm with unapologetic optimism'}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-black/70 md:text-xl">
            {settings.heroSubheadline ||
              'Soft-yet-structured layers built for sunrise walks, airport sprints, and everything in-between. This is the uniform for people who move with good energy.'}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">
            <span className="rounded-full bg-green text-white px-3 py-1 shadow-soft">Grounded Color</span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-soft ring-1 ring-black/10">Ultra-Soft Touch</span>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-green shadow-soft ring-1 ring-gold/30">Everyday Movement</span>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/shop" className="button-primary text-lg px-8 py-4">
              Shop the drop →
            </Link>
            <Link href="#featured" className="button-secondary text-lg px-8 py-4">
              Feel the vibe
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-full bg-black/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-black/10"
            >
              <span className="h-2 w-2 rounded-full bg-green" />
              Mood care, always on
            </Link>
          </div>
          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-black/5">
              <p className="text-sm font-semibold text-green">2000+ club</p>
              <p className="text-lg font-bold text-foreground">People in the Madhappy loop</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-black/5">
              <p className="text-sm font-semibold text-green">4.9/5 love</p>
              <p className="text-lg font-bold text-foreground">Rated for feel + fit</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-black/5">
              <p className="text-sm font-semibold text-green">Small-batch</p>
              <p className="text-lg font-bold text-foreground">Drops with intention</p>
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(18,49,43,0.18),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(181,150,69,0.2),transparent_45%)] blur-2xl" />
          <div className="relative grid w-full max-w-xl grid-cols-2 gap-4">
            <div className="relative col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-green/30 via-slate-50 to-taupe/40 shadow-2xl ring-1 ring-black/5">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/70 backdrop-blur">
                Built to move
              </div>
            </div>
            <div className="relative -mt-10 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
              <Image
                src={heroImages[2]}
                alt="Madhappy detail shot"
                width={600}
                height={700}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
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
