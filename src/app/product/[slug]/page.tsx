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
  const images = Array.isArray(product.images)
    ? product.images.filter((img): img is string => typeof img === 'string')
    : [];
  const featuredImage = images[0]
    ? { url: images[0], alt: product.title }
    : null;
  const price = product.variants[0]?.priceCents ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container-max grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          {featuredImage?.url && (
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
            {images.slice(1).map((img) => (
              <div key={img} className="relative aspect-square overflow-hidden rounded-lg border border-black/5">
                <Image src={img} alt={product.title} fill className="object-cover" sizes="150px" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">Print on demand</p>
            <h1 className="text-3xl font-semibold">{product.title}</h1>
            <p className="text-lg text-black/70">{formatCurrency(price, 'USD')}</p>
          </div>
          <p className="text-black/70">{product.description}</p>
          <AddToCart
            product={{
              id: product.id,
              printifyProductId: product.printifyProductId,
              title: product.title,
              slug: product.slug,
              images,
              options: Array.isArray(product.options) ? product.options : [],
              variants: product.variants
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
