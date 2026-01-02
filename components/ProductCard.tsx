import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const primaryImage = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-3 rounded-3xl bg-white/80 p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink/5">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 300px, 50vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between text-sm uppercase tracking-wide text-ink/70">
        <span>{product.category}</span>
        {product.featured ? (
          <span className="rounded-full bg-forest/10 px-3 py-1 text-forest">
            new drop
          </span>
        ) : (
          <span className="text-ink/40">core</span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-ink/60">{product.description}</p>
        </div>
        <span className="font-semibold text-forest">{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
