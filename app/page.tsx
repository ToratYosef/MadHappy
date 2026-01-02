import { PinnedStory } from "@/components/PinnedStory";
import { ProductGrid } from "@/components/ProductGrid";
import { EmailCapture } from "@/components/EmailCapture";
import { CategoryChips } from "@/components/CategoryChips";
import { products } from "@/lib/products";
import Link from "next/link";

export default function HomePage() {
  const featured = products.filter((product) => product.featured);
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <main className="flex flex-col gap-14 pb-16">
      <section className="rounded-3xl bg-white/70 p-10 shadow-soft">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-ink/50">
                low key high — studio
              </p>
              <h1 className="text-4xl font-semibold leading-[1.05] md:text-5xl">
                Elevated essentials with a quiet burn.
              </h1>
              <p className="max-w-2xl text-lg text-ink/70">
                Built for late nights, crisp air, and backroom sessions. Layerable, durable,
                and finished with our muted gold key.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-background transition hover:-translate-y-[1px] hover:shadow-lg"
              >
                Shop the drop
              </Link>
              <Link
                href="/product/crest-hoodie-forest"
                className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold transition hover:border-forest"
              >
                Crest hoodie
              </Link>
            </div>
          </div>
          <CategoryChips categories={categories} />
        </div>
      </section>

      <PinnedStory />

      <ProductGrid products={featured} title="Featured" subtle />

      <section className="rounded-3xl bg-white/80 p-10 shadow-soft">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-ink/50">
            <span className="h-[1px] flex-1 bg-ink/10" />
            studio note
            <span className="h-[1px] flex-1 bg-ink/10" />
          </div>
          <p className="text-lg text-ink/70">
            Low key high is a tension between grounded basics and lifted details. Each
            garment is cut for movement, finished with hidden pockets, and washed for
            softness right out of the box.
          </p>
        </div>
      </section>

      <EmailCapture />

      <footer className="flex flex-col gap-4 py-8 text-sm text-ink/60">
        <div className="flex items-center justify-between">
          <span>© low key high</span>
          <div className="flex gap-4">
            <Link href="/shop">Shop</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/success">Orders</Link>
          </div>
        </div>
        <p className="text-ink/50">
          Off-white backgrounds, taupe lows, forest highs. Keep the key close.
        </p>
      </footer>
    </main>
  );
}
