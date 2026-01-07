import AnimatedSection from '@/components/ui/animated-section';
import { ProductCard } from './product-card';
import type { Product } from '@/types/product';
import Link from 'next/link';

export function FeaturedGrid({ products }: { products: Product[] }) {
  const limitedProducts = products.slice(0, 3);
  const hasProducts = limitedProducts.length > 0;
  return (
    <AnimatedSection className="container-max py-12 md:py-16" id="featured">
      <div className="mb-8 space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Featured essentials</h2>
        <p className="text-base md:text-lg text-black/60 mx-auto max-w-2xl">
          Elevated comfort meets minimalist design. Each piece crafted for lasting quality.
        </p>
      </div>
      {hasProducts ? (
        <>
          <div className="grid gap-4 grid-cols-2">
            {limitedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/shop" className="button-primary text-lg px-8 py-4">
              View all products
            </Link>
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-xl space-y-3 rounded-2xl border border-black/5 bg-white/80 p-6 text-center shadow-soft">
          <p className="text-lg font-semibold">No featured products yet</p>
          <p className="text-sm text-black/60">
            Check back soon for curated picks, or browse the full catalog now.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/shop" className="button-primary w-full sm:w-auto">
              Shop all products
            </Link>
            <Link href="/shop" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-green hover:border-green/40">
              Explore collections
            </Link>
          </div>
        </div>
      )}
    </AnimatedSection>
  );
}
