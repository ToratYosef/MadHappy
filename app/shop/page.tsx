import { ProductGrid } from "@/components/ProductGrid";
import { CategoryChips } from "@/components/CategoryChips";
import { products } from "@/lib/products";

export const metadata = {
  title: "Shop — low key high"
};

export default function ShopPage() {
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <main className="flex flex-col gap-10 pb-16">
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Shop</p>
        <h1 className="text-3xl font-semibold">All releases</h1>
        <p className="text-ink/60">
          Core pieces alongside the newest drop. Clean silhouettes, soft handfeel, built to
          layer.
        </p>
      </div>
      <CategoryChips categories={categories} />
      <ProductGrid products={products} />
    </main>
  );
}
