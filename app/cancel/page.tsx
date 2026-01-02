import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled — low key high"
};

export default function CancelPage() {
  return (
    <main className="flex flex-col gap-8 pb-16">
      <div className="rounded-3xl bg-white/70 p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Order paused</p>
        <h1 className="mt-3 text-3xl font-semibold">Checkout cancelled</h1>
        <p className="mt-3 text-ink/70">
          No worries. Your selections are saved in the bag if you want to try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/cart"
            className="rounded-full bg-forest px-6 py-3 text-background transition hover:-translate-y-[1px] hover:shadow-lg"
          >
            Back to bag
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-ink/20 px-6 py-3 text-ink transition hover:border-forest"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
