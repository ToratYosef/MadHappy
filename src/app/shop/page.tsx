import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
import { ProductCard } from '@/components/storefront/product-card';
import { getProducts } from '@/lib/queries/products';

interface ShopPageProps {
  searchParams: { sort?: string; q?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts({
    sort: searchParams.sort,
    search: searchParams.q
  });

  const sorted =
    searchParams.sort?.startsWith('price') && products.length
      ? [...products].sort((a, b) => {
          const aPrice = a.variants[0]?.priceCents ?? 0;
          const bPrice = b.variants[0]?.priceCents ?? 0;
          return searchParams.sort === 'price-desc' ? bPrice - aPrice : aPrice - bPrice;
        })
      : products;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <StickyPromoBannerSection />
      <section className="container-max py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-black/60">Shop the collection</p>
            <h1 className="text-3xl font-semibold">All products</h1>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
