import AnimatedSection from '@/components/ui/animated-section';
import { ProductCard } from './product-card';
import type { Product } from '@/types/product';
import Link from 'next/link';

export function FeaturedGrid({ products }: { products: Product[] }) {
  const limitedProducts = products.slice(0, 3);
  const hasProducts = limitedProducts.length > 0;
  return (
<<<<<<< HEAD
    <AnimatedSection className="container-max py-10 md:py-16" id="featured">
      <div className="mb-8 space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Featured essentials</h2>
        <p className="text-base md:text-lg text-black/60 mx-auto max-w-2xl">
          Elevated comfort meets minimalist design. Each piece crafted for lasting quality.
        </p>
=======
    <AnimatedSection className="container-max py-12 md:py-16" id="featured">
      <div className="mb-6 md:mb-8 space-y-2 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight md:text-5xl">Featured essentials</h2>
        <p className="text-base md:text-lg text-black/60 mx-auto max-w-2xl">Elevated comfort meets minimalist design. Each piece crafted for lasting quality.</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {limitedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-8 md:mt-10 text-center">
        <Link href="/shop" className="button-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
          View all products
        </Link>
>>>>>>> 6083d6f (Temp pre-rebase commit)
      </div>
      {hasProducts ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
