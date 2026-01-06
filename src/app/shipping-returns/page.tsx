import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import AnimatedSection from '@/components/ui/animated-section';
import { Truck, RotateCcw, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';

const shippingSteps = [
  {
    title: 'Processing',
    detail: 'Orders pack within 1-2 business days. Made-to-order items ship within 3-5 days.',
    icon: ShieldCheck
  },
  {
    title: 'Shipping',
    detail: 'Standard: 5-7 business days. Expedited: 2-3 business days at checkout.',
    icon: Truck
  },
  {
    title: 'Tracking',
    detail: 'Tracking goes live the moment your label is created. You’ll get email updates at every handoff.',
    icon: Mail
  }
];

const returnPolicy = [
  '30-day returns and exchanges on unworn items with tags.',
  'Prepaid label provided for returns within the US.',
  'Refunds issued to original payment method within 3-5 days after inspection.',
  'Final sale items are clearly marked at checkout.'
];

export default function ShippingReturnsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50/30 to-white">
      <Navbar />
      <div className="container-max flex-1 py-12 md:py-16 space-y-10">
        <AnimatedSection className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-green">Shipping & Returns</p>
          <h1 className="text-4xl font-bold">Clear timelines. No surprises.</h1>
          <p className="text-lg text-black/70">Honest shipping windows, easy tracking, and a return policy built for peace of mind.</p>
        </AnimatedSection>

        <AnimatedSection className="grid gap-6 md:grid-cols-3">
          {shippingSteps.map(({ title, detail, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-soft">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-green/10">
                <Icon className="h-5 w-5 text-green" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-black/70 leading-relaxed mt-1">{detail}</p>
            </div>
          ))}
        </AnimatedSection>

        <AnimatedSection className="rounded-3xl border border-black/5 bg-white/90 p-8 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-green">Returns</p>
              <h2 className="text-2xl font-bold">30-day, no-stress returns</h2>
              <p className="text-black/70">
                Try it on at home. If it’s not a match, we make it easy to send back or exchange for a better fit.
              </p>
            </div>
            <ul className="max-w-xl space-y-3 text-sm text-black/80">
              {returnPolicy.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>

        <AnimatedSection className="rounded-2xl border border-green/20 bg-green/5 px-6 py-8 text-center shadow-soft">
          <h3 className="text-lg font-semibold mb-2">Need an update?</h3>
          <p className="text-sm text-black/70 mb-4">Email us for shipping status, exchanges, or return labels.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a className="button-primary" href="mailto:support@lowkeyhigh.com">support@lowkeyhigh.com</a>
            <Link className="button-secondary" href="/track-order">Track my order</Link>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
