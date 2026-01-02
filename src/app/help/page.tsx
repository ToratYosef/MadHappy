import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import Link from 'next/link';
import { Mail, Package, Truck, RotateCcw } from 'lucide-react';

export default function HelpPage() {
  const faqItems = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by visiting the "Track Order" page in your account. You\'ll see real-time updates on your order status and shipping information.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer 30 days returns on all items. Items must be in original condition with tags attached. Contact us for a return authorization.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Expedited shipping is available at checkout for faster delivery.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within the United States. International shipping coming soon!'
    },
    {
      question: 'How can I apply a promo code?',
      answer: 'Enter your promo code at checkout before submitting payment. The discount will be automatically applied to your order.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) via Stripe secure checkout.'
    }
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'support@lowkeyhigh.com',
      action: 'Send Email'
    },
    {
      icon: Package,
      title: 'Order Status',
      description: 'Check your order status anytime',
      action: 'Track Order',
      href: '/track-order'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex-1 py-10">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold">Help & Support</h1>
            <p className="text-black/70 mt-2">Find answers to common questions or contact us for assistance.</p>
          </div>

          {/* Contact Options */}
          <div className="grid gap-6 md:grid-cols-2">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.title}
                  className="rounded-xl border border-black/5 bg-white p-6 shadow-soft"
                >
                  <Icon className="h-8 w-8 text-green mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <p className="text-black/70 text-sm mb-4">{option.description}</p>
                  {option.href ? (
                    <Link href={option.href} className="text-green hover:underline font-semibold text-sm">
                      {option.action} →
                    </Link>
                  ) : (
                    <a href={`mailto:${option.description}`} className="text-green hover:underline font-semibold text-sm">
                      {option.action} →
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <details
                  key={idx}
                  className="rounded-xl border border-black/5 bg-white shadow-soft group"
                >
                  <summary className="cursor-pointer p-6 font-semibold flex items-center justify-between">
                    {item.question}
                    <span className="text-black/40 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="border-t border-black/5 px-6 py-4 text-black/70">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Additional Help */}
          <div className="rounded-xl border border-green/20 bg-green/5 p-8 text-center">
            <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
            <p className="text-black/70 mb-4">Our support team is here to help. Reach out to us via email.</p>
            <a
              href="mailto:support@lowkeyhigh.com"
              className="text-green hover:underline font-semibold"
            >
              support@lowkeyhigh.com
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
