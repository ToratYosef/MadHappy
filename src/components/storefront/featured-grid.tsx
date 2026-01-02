import AnimatedSection from '@/components/ui/animated-section';
import { ProductCard } from './product-card';
import type { PrintifyProduct } from '@/types/printify';

export function FeaturedGrid({ products }: { products: PrintifyProduct[] }) {
  return (
    <AnimatedSection className="container-max py-12" id="featured">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title">Featured essentials</h2>
        <p className="text-sm text-black/60">Elevated layers in neutral palettes.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </AnimatedSection>
  );
}
