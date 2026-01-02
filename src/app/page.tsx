import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { FeaturedGrid } from '@/components/storefront/featured-grid';
import { Hero } from '@/components/storefront/hero';
import { getFeaturedProducts } from '@/lib/queries/products';
import { getSiteSettings } from '@/lib/queries/settings';

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSiteSettings(), getFeaturedProducts()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Hero settings={{ heroHeadline: settings?.heroHeadline, heroSubheadline: settings?.heroSubheadline }} />
      <FeaturedGrid products={featured} />
      <Footer />
    </div>
  );
}
