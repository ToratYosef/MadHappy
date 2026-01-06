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

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSiteSettings(), getFeaturedProducts()]);

  const vibeSpreads = [
    {
      title: 'Studio monochrome set',
      copy: 'Brushed fleece hoodie and sweatpant pairing with tonal drawcords and matte hardware.',
      tag: 'New drop',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80&sat=-12'
    },
    {
      title: 'Earth-tone outer layers',
      copy: 'Lightweight shell with hidden pockets and water-resistant finish for everyday runs.',
      tag: 'Bestseller',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80&sat=-8'
    },
    {
      title: 'Relaxed knit staples',
      copy: 'Airy knits with subtle slub texture. Built for transitional weather and long flights.',
      tag: 'Limited',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80&sat=-10'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <StickyPromoBannerSection />
      <Hero settings={{ heroHeadline: settings?.heroHeadline, heroSubheadline: settings?.heroSubheadline }} />

      <AnimatedSection className="container-max py-12 md:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-green">Lookbook</p>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Designed to move with you</h2>
            <p className="max-w-2xl text-lg text-black/60">
              Built for city sprints, coffee runs, and golden-hour hangs. Mix, match, and layer the pieces that feel like you.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-green"></span>
            Curated in Los Angeles
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {vibeSpreads.map((spread) => (
            <div
              key={spread.title}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={spread.image}
                  alt={spread.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/70 backdrop-blur">
                  {spread.tag}
                </div>
              </div>
              <div className="space-y-2 px-5 py-4">
                <h3 className="text-xl font-semibold">{spread.title}</h3>
                <p className="text-sm text-black/60">{spread.copy}</p>
                <div className="pt-1 text-sm font-semibold text-green transition group-hover:translate-x-1">
                  Shop the look →
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>
      
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

      {/* Testimonials Section */}
      <AnimatedSection className="bg-gradient-to-b from-white to-slate-50/50 py-16 md:py-24">
        <div className="container-max">
          <div className="mb-12 space-y-3 text-center">
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
