import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import AnimatedSection from '@/components/ui/animated-section';
import { Info } from 'lucide-react';

const faqs = [
  {
    question: 'How does sizing run?',
    answer: 'True-to-size with a relaxed drape. Size up for an oversized look. Check the size guide on each product page for garment measurements.'
  },
  {
    question: 'Where are items made?',
    answer: 'We partner with responsible factories in Portugal, Vietnam, and the US depending on fabric and technique. Every drop is QC’d in-house before shipping.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard US shipping is 5-7 business days after processing. Expedited options are available at checkout. Tracking goes live once your label is created.'
  },
  {
    question: 'Can I return or exchange?',
    answer: 'Yes. You have 30 days from delivery for returns or exchanges on unworn items with tags. Start with your order number and we’ll send a prepaid label.'
  },
  {
    question: 'How should I wash it?',
    answer: 'Cold wash, inside-out, gentle cycle. Hang dry or tumble low. Avoid harsh detergents or fabric softeners to preserve color and print.'
  }
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50/40 to-white">
      <Navbar />
      <div className="container-max flex-1 py-12 md:py-16">
        <AnimatedSection className="mb-10 space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-green">FAQ</p>
          <h1 className="text-4xl font-bold">Answers before you ask.</h1>
          <p className="text-lg text-black/70">Sizing, shipping, returns, care—here’s everything you need to feel confident checking out.</p>
        </AnimatedSection>

        <AnimatedSection className="grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-black/5 bg-white/80 p-5 shadow-soft"
              open
            >
              <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold">
                <span>{item.question}</span>
                <span className="text-black/40 group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="mt-3 text-sm text-black/70 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </AnimatedSection>

        <AnimatedSection className="mt-10 flex items-center gap-3 rounded-2xl border border-green/20 bg-green/5 p-6 shadow-soft">
          <Info className="h-6 w-6 text-green" />
          <div className="space-y-1">
            <p className="font-semibold">Still have questions?</p>
            <p className="text-sm text-black/70">Email support@lowkeyhigh.com or check <a href="/shipping-returns" className="text-green hover:underline">Shipping & Returns</a> for policies.</p>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
