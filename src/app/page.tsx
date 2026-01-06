import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { FeaturedGrid } from '@/components/storefront/featured-grid';
import { Hero } from '@/components/storefront/hero';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
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
      <StickyPromoBannerSection />
      <Hero settings={{ heroHeadline: settings?.heroHeadline, heroSubheadline: settings?.heroSubheadline }} />

      {/* Features Section */}
      <AnimatedSection className="border-y border-black/5 bg-slate-50/50 py-16">
        <div className="container-max">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
                <Truck className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">Fast Dispatch</h3>
              <p className="text-sm text-black/60">Ships within 48 hours</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
                <Shield className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">Secure Payment</h3>
              <p className="text-sm text-black/60">100% secure transactions</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
                <Package className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-sm text-black/60">30-day return policy</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
                <Star className="h-7 w-7 text-green" />
              </div>
              <h3 className="font-semibold">Premium Quality</h3>
              <p className="text-sm text-black/60">Carefully selected materials</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <FeaturedGrid products={featured} />

      {/* Travel Capsule Section */}
      <AnimatedSection className="container-max py-12 md:py-16">
        <div className="grid gap-8 md:gap-12 items-center md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Travel capsule just landed</h2>
            <p className="text-lg text-black/70">Travel-ready layers built for takeoff</p>
            <p className="text-black/60 leading-relaxed">
              Elevated essentials engineered for red-eyes, layovers, and everything between departure and arrival.
            </p>
            <div className="pt-2">
              <Link href="/shop" className="inline-block text-green font-semibold transition hover:translate-x-1">
                Shop collection →
              </Link>
            </div>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl max-w-sm mx-auto md:mx-0 md:max-w-none">
            <Image
              src="https://images.unsplash.com/photo-1490562967868-a82efb1c470d?auto=format&fit=crop&w=600&q=80"
              alt="Travel capsule collection"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection className="border-y border-black/5 bg-slate-50/50 py-12 md:py-16">
        <div className="container-max">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-2 text-center">
              <p className="text-3xl md:text-4xl font-bold">2000+</p>
              <p className="text-black/60">Happy customers</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-3xl md:text-4xl font-bold">4.9/5</p>
              <p className="text-black/60">Average rating</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-3xl md:text-4xl font-bold">Made</p>
              <p className="text-black/60">In small batches</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="bg-gradient-to-b from-white to-slate-50/50 py-12 md:py-16">
        <div className="container-max">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">What our customers say</h2>
            <p className="text-lg text-black/60 mx-auto max-w-2xl">Real reviews from real people who love our gear.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-soft">
              <div className="mb-4 flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mb-4 text-black/80">
                &quot;Best hoodie I&apos;ve ever owned. The quality is incredible and it fits perfectly. Worth every penny.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green/20" />
                <div>
                  <p className="font-semibold">Alex Martinez</p>
                  <p className="text-xs text-black/50">Verified buyer</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-soft">
              <div className="mb-4 flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mb-4 text-black/80">
                &quot;Subtle design, premium feel. These are now my go-to pieces for everyday wear.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green/20" />
                <div>
                  <p className="font-semibold">Jordan Lee</p>
                  <p className="text-xs text-black/50">Verified buyer</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-soft">
              <div className="mb-4 flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mb-4 text-black/80">
                &quot;Fast shipping, great quality, and the customer service is top-notch. Highly recommend!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green/20" />
                <div>
                  <p className="font-semibold">Sam Rivera</p>
                  <p className="text-xs text-black/50">Verified buyer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}
