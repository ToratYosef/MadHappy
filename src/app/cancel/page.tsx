import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-black/50">Checkout canceled</p>
        <h1 className="text-3xl font-semibold">Order not completed.</h1>
        <p className="max-w-xl text-black/70">
          Your cart is still saved. You can return to checkout at any time or continue browsing the collection.
        </p>
        <div className="flex gap-3">
          <Link href="/cart" className="button-primary">
            Return to cart
          </Link>
          <Link href="/shop" className="button-secondary">
            Browse products
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
