import AnimatedSection from '@/components/ui/animated-section';
import { ProductCard } from './product-card';
import type { Product } from '@/types/product';
import Link from 'next/link';

export function FeaturedGrid({ products }: { products: Product[] }) {
  return (
    <AnimatedSection className="container-max py-16 md:py-24" id="featured">
      <div className="mb-12 space-y-3 text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Featured essentials</h2>
        <p className="text-lg text-black/60 mx-auto max-w-2xl">Elevated comfort meets minimalist design. Each piece crafted for lasting quality.</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/shop" className="button-primary text-lg px-8 py-4">
          View all products
        </Link>
      </div>
    </AnimatedSection>
  );
}
