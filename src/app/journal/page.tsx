import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import AnimatedSection from '@/components/ui/animated-section';
import Link from 'next/link';

const entries = [
  {
    title: 'Drop 04: Terminal Calm',
    date: 'This week',
    summary: 'Travel capsule built for departures and arrivals—wrinkle-resistant fleece, modular pockets, and breathable knits.',
    cta: 'See the lookbook',
    href: '/lookbook'
  },
  {
    title: 'Fabric story: Brushed loopback',
    date: '2 weeks ago',
    summary: 'Why we picked a midweight cotton blend that holds shape but still drapes. Pre-shrunk, enzyme-washed, ready to live in.',
    cta: 'Shop the fleece',
    href: '/shop'
  },
  {
    title: 'Design notes: “Why this piece exists”',
    date: '1 month ago',
    summary: 'We cut logos and amplified fit. Hidden phone pocket, heat-resistant drawcord tips, and collar stability stitching.',
    cta: 'Explore product pages',
    href: '/shop'
  }
];

export default function JournalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50/40 to-white">
      <Navbar />
      <div className="container-max flex-1 py-12 md:py-16 space-y-8">
        <AnimatedSection className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-green">Journal</p>
          <h1 className="text-4xl font-bold">Drops, stories, and behind-the-scenes.</h1>
          <p className="text-lg text-black/70">Short entries to keep the brand feeling alive.</p>
        </AnimatedSection>

        <AnimatedSection className="grid gap-6 md:grid-cols-3">
          {entries.map((entry) => (
            <div key={entry.title} className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-soft flex flex-col justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-black/50">{entry.date}</p>
                <h3 className="text-xl font-semibold">{entry.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{entry.summary}</p>
              </div>
              <Link href={entry.href} className="mt-4 inline-flex items-center gap-2 text-green font-semibold hover:gap-3 transition">
                {entry.cta} →
              </Link>
            </div>
          ))}
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
