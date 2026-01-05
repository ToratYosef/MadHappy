import { notFound } from 'next/navigation';
import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
import { getProductBySlug, getFeaturedProducts } from '@/lib/queries/products';
import ProductDetail from './parts/product-detail';
import ProductCard from '@/components/storefront/product-card';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const [product, relatedProducts] = await Promise.all([
    getProductBySlug(params.slug),
    getFeaturedProducts()
  ]);
  
  if (!product) return notFound();

  // Get up to 4 related products (excluding current product)
  const related = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <StickyPromoBannerSection />
      <ProductDetail product={product} />
      
      {/* Related Products Section */}
      <div className="bg-slate-50/50 py-16 border-t border-black/5">
        <div className="container-max">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">You may also like</h2>
            <p className="text-sm text-black/60">Check out these similar products</p>
          </div>
          {related.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/50">No related products available</p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
