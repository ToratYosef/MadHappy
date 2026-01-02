import { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  title?: string;
  subtle?: boolean;
};

export function ProductGrid({ products, title, subtle }: Props) {
  return (
    <section className="flex flex-col gap-6">
      {title ? (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {subtle && <span className="text-sm text-ink/50">See everything in Shop</span>}
        </div>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
