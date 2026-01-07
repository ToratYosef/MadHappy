import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import StickyPromoBannerSection from '@/components/storefront/sticky-promo-banner-section';
import TrackOrderForm from './track-order-form';

export default async function TrackOrderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <StickyPromoBannerSection />
      <section className="container-max flex-1 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Track Order</h1>
            <p className="text-black/70">Enter your order number to view the latest status.</p>
          </div>
          <TrackOrderForm />
        </div>
      </section>
      <Footer />
    </div>
  );
}
