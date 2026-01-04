import { notFound } from 'next/navigation';
import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { getProductBySlug } from '@/lib/queries/products';
import ProductDetail from './parts/product-detail';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
    </div>
  );
}
