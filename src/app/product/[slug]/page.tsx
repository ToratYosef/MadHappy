import { notFound } from 'next/navigation';
import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { getProductBySlug } from '@/lib/queries/products';
import { formatCurrency } from '@/lib/utils';
import ProductClient from './product-client';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const images = Array.isArray(product.images)
    ? product.images.filter((img) => !!img?.url)
    : [];
  const price = product.variants[0]?.priceCents ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container-max py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-black/50">Print on demand</p>
          <h1 className="mt-2 text-3xl font-semibold">{product.title}</h1>
          <p className="mt-2 text-lg text-black/70">{formatCurrency(price, 'USD')}</p>
          <p className="mt-4 text-black/70">{product.description}</p>
        </div>
        <ProductClient product={{ ...product, images, options: Array.isArray(product.options) ? product.options : [] }} />
      </div>
      <Footer />
    </div>
  );
}
