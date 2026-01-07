import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { FeaturedGrid } from '@/components/storefront/featured-grid';
import { Hero } from '@/components/storefront/hero';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
import { ReviewsCarousel } from '@/components/storefront/reviews-carousel';
import { getFeaturedProducts } from '@/lib/queries/products';
import { getSiteSettings } from '@/lib/queries/settings';
import AnimatedSection from '@/components/ui/animated-section';
import { Package, Shield, Truck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSiteSettings(), getFeaturedProducts()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* FREE SHIPPING BANNER */}
      <div className="bg-gradient-to-r from-green via-green/90 to-green py-3 text-center">
        <p className="text-lg md:text-2xl font-bold text-white tracking-wide uppercase">
          ✨ FREE SHIPPING ON ALL ORDERS ✨
        </p>
      </div>
      <StickyPromoBannerSection />
      <Hero settings={{ heroHeadline: settings?.heroHeadline, heroSubheadline: settings?.heroSubheadline }} />

      <AnimatedSection className="border-y border-black/5 bg-white/80 py-4">
        <div className="container-max flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.24em] text-black/60">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green" />
            2000+ verified buyers
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green" />
            4.9/5 average rating
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green" />
            48-hour dispatch
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-green" />
            Easy returns
          </span>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className="hidden md:block border-y border-black/5 bg-gradient-to-r from-white via-slate-50/60 to-white py-12 md:py-16 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-green/5 blur-2xl animate-pulse" />
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl animate-pulse" />
        <div className="container-max relative z-10">
          <div className="mb-6 md:mb-8 flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green">Why the community stays</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight md:text-4xl">Optimism, woven into every drop</h2>
          </div>
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            <div className="group space-y-3 text-center transform transition-all hover:-translate-y-2 hover:scale-105">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10 shadow-soft group-hover:shadow-lg group-hover:bg-green/20 transition-all">
                <Truck className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">48-hour moves</h3>
              <p className="text-sm text-black/60">We dispatch fast so you can live in the moment.</p>
            </div>
            <div className="group space-y-3 text-center transform transition-all hover:-translate-y-2 hover:scale-105">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 shadow-soft group-hover:shadow-lg group-hover:bg-gold/25 transition-all">
                <Shield className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">Protected energy</h3>
              <p className="text-sm text-black/60">Secure checkout and support that actually cares.</p>
            </div>
            <div className="group space-y-3 text-center transform transition-all hover:-translate-y-2 hover:scale-105">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10 shadow-soft group-hover:shadow-lg group-hover:bg-green/20 transition-all">
                <Package className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">No-stress returns</h3>
              <p className="text-sm text-black/60">30 days to try it on, move, and fall in love.</p>
            </div>
            <div className="group space-y-3 text-center transform transition-all hover:-translate-y-2 hover:scale-105">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 shadow-soft group-hover:shadow-lg group-hover:bg-gold/25 transition-all">
                <Star className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">Feel-good craft</h3>
              <p className="text-sm text-black/60">Premium fabrics, mindful details, elevated comfort.</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <FeaturedGrid products={featured} />

      {/* Travel Capsule Section */}
      <AnimatedSection className="md:hidden container-max py-10">
        <div className="space-y-6 px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-green">
            <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
            New Drop
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">Travel capsule just landed</h2>
            <p className="text-sm text-black/70">Travel-ready layers built for takeoff.</p>
            <p className="text-sm text-black/60">
              Elevated essentials engineered for red-eyes, layovers, and everything between departure and arrival.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5">
            <div className="absolute inset-0 bg-gradient-to-t from-green/25 to-transparent" />
            <Image
              src="/assets/couples.png"
              alt="Travel capsule collection"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 text-green font-semibold transition hover:gap-3 group">
            <span>Shop collection</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </AnimatedSection>
      <AnimatedSection className="hidden md:block container-max py-12 md:py-16">
        <div className="grid gap-8 md:gap-12 items-center md:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-green">
              <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
              New Drop
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Travel capsule just landed</h2>
            <p className="text-lg text-black/70">Travel-ready layers built for takeoff</p>
            <p className="text-black/60 leading-relaxed">
              Elevated essentials engineered for red-eyes, layovers, and everything between departure and arrival.
            </p>
            <div className="pt-2">
              <Link href="/shop" className="inline-flex items-center gap-2 text-green font-semibold transition hover:gap-3 group">
                <span>Shop collection</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
          <div className="relative aspect-[9/16] overflow-hidden rounded-2xl max-w-sm mx-auto md:mx-0 md:max-w-md group">
            <div className="absolute inset-0 bg-gradient-to-t from-green/20 to-transparent z-10 group-hover:from-green/30 transition-all" />
            <Image
              src="/assets/couples.png"
              alt="Travel capsule collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection className="border-y border-black/5 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 py-12 md:py-16 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,49,43,0.05),transparent_50%),radial-gradient(circle_at_80%_50%,rgba(181,150,69,0.08),transparent_50%)]" />
        <div className="container-max relative z-10">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
            <div className="space-y-2 text-center group transform transition-all hover:scale-110">
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green to-green/70 bg-clip-text text-transparent">2000+</p>
              <p className="text-sm text-black/60">Happy customers</p>
            </div>
            <div className="space-y-2 text-center group transform transition-all hover:scale-110">
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gold to-green bg-clip-text text-transparent">4.9/5</p>
              <p className="text-sm text-black/60">Average rating</p>
            </div>
            <div className="space-y-2 text-center group transform transition-all hover:scale-110">
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green to-green/70 bg-clip-text text-transparent">Made</p>
              <p className="text-sm text-black/60">In small batches</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="bg-gradient-to-b from-white via-slate-50/30 to-white py-12 md:py-16 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-green/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-max relative z-10">
          <div className="mb-12 space-y-2 text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">What our customers say</h2>
            <p className="text-lg text-black/60 mx-auto max-w-2xl">Real reviews from real people who love our gear.</p>
          </div>
          <ReviewsCarousel />
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}
