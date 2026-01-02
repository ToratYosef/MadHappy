import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { ProductCard } from '@/components/storefront/product-card';
import { getProducts } from '@/lib/queries/products';

interface ShopPageProps {
  searchParams: { category?: string; sort?: string; q?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts({
    category: searchParams.category,
    sort: searchParams.sort,
    search: searchParams.q
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-black/60">Shop the collection</p>
            <h1 className="text-3xl font-semibold">All products</h1>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
