/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/animated-section';

const heroImages = [
  // Left (primary) hero image – served directly (no Next Image optimization)
  '/assets/Woman_in_Lavender.png',
  '/assets/boy.png',
  'https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg?auto=compress&cs=tinysrgb&w=600&h=700&fit=crop'
];

export function Hero({ settings }: { settings: { heroHeadline?: string | null; heroSubheadline?: string | null } }) {
  return (
    <>
      {/* Mobile Hero */}
      <div 
        className="relative md:hidden overflow-hidden bg-cover bg-center h-[90vh] flex flex-col justify-between items-center pb-4"
        style={{
          backgroundImage: `url('${heroImages[0]}')`,
          backgroundPosition: 'center top'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        
        <div className="relative z-10 container-max px-4 py-8 space-y-4 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex justify-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="LowKeyHigh"
              width={600}
              height={210}
              style={{ width: 'auto', height: 'auto' }}
              className="h-48 md:h-64"
              priority
            />
          </div>
          
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            <span className="h-px w-4 bg-white" />
            Optimism Made Tangible
          </div>
          
          <h1 className="text-2xl font-black leading-tight tracking-tight text-white">
            {settings.heroHeadline || 'City-ready calm with unapologetic optimism'}
          </h1>
          
          <p className="max-w-xs text-xs leading-relaxed text-white/90">
            {settings.heroSubheadline ||
              'Soft-yet-structured layers built for sunrise walks, airport sprints, and everything in-between.'}
          </p>
          
          <div className="flex flex-col gap-2 pt-2 w-full max-w-xs">
            <Link href="/shop" className="button-primary px-4 py-2 text-sm w-full text-center">
              Shop the drop →
            </Link>
            <Link href="#featured" className="button-secondary px-4 py-2 text-sm w-full text-center">
              Feel the vibe
            </Link>
          </div>
        </div>

        {/* Feature Cards at Bottom */}
        <div className="relative z-20 w-full px-2">
          <div className="bg-white/95 rounded-xl p-3 space-y-2 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-green">Why the community stays</p>
            <p className="text-xs font-bold text-foreground mb-3">Optimism, woven into every drop</p>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green/5 rounded-lg p-2">
                <p className="text-xs font-semibold text-foreground">48-hour moves</p>
                <p className="text-xs text-black/60">We dispatch fast</p>
              </div>
              <div className="bg-green/5 rounded-lg p-2">
                <p className="text-xs font-semibold text-foreground">Protected energy</p>
                <p className="text-xs text-black/60">Secure checkout</p>
              </div>
              <div className="bg-green/5 rounded-lg p-2">
                <p className="text-xs font-semibold text-foreground">No-stress returns</p>
                <p className="text-xs text-black/60">30 days to try</p>
              </div>
              <div className="bg-green/5 rounded-lg p-2">
                <p className="text-xs font-semibold text-foreground">Feel-good craft</p>
                <p className="text-xs text-black/60">Premium fabrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Hero */}
      <div className="hidden md:block relative overflow-hidden bg-gradient-to-b from-[#f6efe2] via-white to-[#e9f3ed]">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-green/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-green/5 blur-3xl animate-pulse" />
        </div>
        <AnimatedSection className="container-max relative grid gap-12 py-4 grid-cols-[1.05fr_1fr] items-center py-8">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex justify-center -mb-16">
              <Image
                src="/logo.png"
                alt="LowKeyHigh"
                width={600}
                height={210}
                className="w-auto h-64"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-green shadow-soft ring-1 ring-black/5">
              <span className="h-px w-8 bg-green" />
              Optimism Made Tangible
            </div>
            <h1 className="text-balance text-6xl font-black leading-tight tracking-tight text-foreground">
              {settings.heroHeadline || 'City-ready calm with unapologetic optimism'}
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-black/70">
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
            <div className="grid gap-3 pt-4 grid-cols-3">
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
              <div className="relative col-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-green/25 via-slate-50 to-taupe/35 shadow-2xl ring-1 ring-black/5 max-h-[900px] aspect-[4/5] mx-auto">
                <img
                  src={heroImages[0]}
                  alt="Lavender hoodie"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
                  Launch mood
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/boy.png"
                  alt="Lounge set"
                  width={600}
                  height={700}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
              </div>
              <div className="relative -mt-10 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
                <Image
                  src={heroImages[2]}
                  alt="Detail shot"
                  width={600}
                  height={700}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
                  Earthy tones
                </div>
              </div>
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gold/30 blur-3xl" />
              <div className="absolute -left-8 -bottom-12 h-24 w-24 rounded-full bg-green/20 blur-3xl" />
            </div>
            <div className="absolute -right-4 bottom-6 w-48 rotate-[-6deg] rounded-3xl bg-white/90 p-4 text-sm font-semibold text-green shadow-2xl ring-1 ring-black/10">
              Good energy only
              <p className="text-xs font-normal text-black/60">Layered textures. Optimistic palette. Ready for the city.</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
}
