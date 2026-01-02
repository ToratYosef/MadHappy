import Image from 'next/image';
import { notFound } from 'next/navigation';
import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import { getProductBySlug } from '@/lib/queries/products';
import { formatCurrency } from '@/lib/utils';
import AddToCart from './parts/add-to-cart';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const featuredImage = product.images[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container-max grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          {featuredImage && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
              <Image
                src={featuredImage.url}
                alt={featuredImage.alt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 90vw"
              />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {product.images.slice(1).map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-black/5">
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="150px" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">{product.category}</p>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <p className="text-lg text-black/70">{formatCurrency(product.priceCents, product.currency)}</p>
          </div>
          <p className="text-black/70">{product.description}</p>
          <AddToCart product={product} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
