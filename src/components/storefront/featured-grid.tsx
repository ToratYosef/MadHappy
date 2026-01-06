import AnimatedSection from '@/components/ui/animated-section';
import { ProductCard } from './product-card';
import type { Product } from '@/types/product';
import Link from 'next/link';

export function FeaturedGrid({ products }: { products: Product[] }) {
  const limitedProducts = products.slice(0, 3);
  return (
    <AnimatedSection className="container-max py-12 md:py-16" id="featured">
      <div className="mb-8 space-y-2 text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Featured essentials</h2>
        <p className="text-lg text-black/60 mx-auto max-w-2xl">Elevated comfort meets minimalist design. Each piece crafted for lasting quality.</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {limitedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/shop" className="button-primary text-lg px-8 py-4">
          View all products
        </Link>
      </div>
    </AnimatedSection>
  );
}
