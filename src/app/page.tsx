import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { FeaturedGrid } from '@/components/storefront/featured-grid';
import { Hero } from '@/components/storefront/hero';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
import { getFeaturedProducts } from '@/lib/queries/products';
import { getSiteSettings } from '@/lib/queries/settings';
import AnimatedSection from '@/components/ui/animated-section';
import { Package, Shield, Truck, Star } from 'lucide-react';

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
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-sm text-black/60">On orders over $50</p>
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
                "Best hoodie I've ever owned. The quality is incredible and it fits perfectly. Worth every penny."
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
                "Subtle design, premium feel. These are now my go-to pieces for everyday wear."
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
                "Fast shipping, great quality, and the customer service is top-notch. Highly recommend!"
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
