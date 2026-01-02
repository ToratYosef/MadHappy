import Link from "next/link";

export const metadata = {
  title: "Order received — low key high"
};

export default function SuccessPage() {
  return (
    <main className="flex flex-col gap-8 pb-16">
      <div className="rounded-3xl bg-white/70 p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.25em] text-forest">Success</p>
        <h1 className="mt-3 text-3xl font-semibold">Order received</h1>
        <p className="mt-3 text-ink/70">
          We just sent a confirmation email. You’ll receive shipping details once the order
          is on the move.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-forest px-6 py-3 text-background transition hover:-translate-y-[1px] hover:shadow-lg"
          >
            Keep browsing
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-ink/20 px-6 py-3 text-ink transition hover:border-forest"
          >
            View bag
          </Link>
        </div>
      </div>
    </main>
  );
}
