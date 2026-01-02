import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductGallery } from "@/components/ProductGallery";
import { findProductBySlug, products } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props) {
  const product = findProductBySlug(params.slug);
  return {
    title: product ? `${product.name} — low key high` : "Product — low key high",
    description: product?.description
  };
}

export default function ProductPage({ params }: Props) {
  const product = findProductBySlug(params.slug);
  if (!product) return notFound();

  return (
    <main className="flex flex-col gap-10 pb-16">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-ink/50">
        <Link href="/shop" className="hover:text-forest">
          Shop
        </Link>
        <span className="h-px w-8 bg-ink/20" />
        <span>{product.category}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.4fr,1fr]">
        <ProductGallery images={product.images} alt={product.name} />
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <p className="text-lg text-forest">{formatPrice(product.price)}</p>
            <p className="text-ink/70">{product.description}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Details</p>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-ink/70">
              <li>Pre-washed for softness; structured seams for layering.</li>
              <li>Mutated gold hardware and branded keyline pull tabs.</li>
              <li>Built to pair with the Signal tee and Vault cap.</li>
            </ul>
          </div>
          <AddToCartForm product={product} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/70">
            <p className="font-semibold uppercase tracking-[0.2em] text-ink">Shipping</p>
            <p className="mt-2">
              Ships in 2–4 business days. Free domestic shipping over $150. Duties covered
              on international orders.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
