import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-green">Order placed</p>
        <h1 className="text-3xl font-semibold">Thank you for your order.</h1>
        <p className="max-w-xl text-black/70">
          Your receipt and shipping details have been sent to your email. We&apos;ll let you know once it ships.
        </p>
        <div className="flex gap-3">
          <Link href="/shop" className="button-primary">
            Continue shopping
          </Link>
          <Link href="/" className="button-secondary">
            Return home
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
