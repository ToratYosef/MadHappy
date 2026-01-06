import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import AnimatedSection from '@/components/ui/animated-section';
import Image from 'next/image';
import Link from 'next/link';

const pillars = [
  {
    title: 'Why we exist',
    body: 'LowKeyHigh was built to deliver quiet confidence—pieces that move with you from sunrise walks to late flights without screaming for attention.'
  },
  {
    title: 'What we stand for',
    body: 'Intentional drops, premium fabrics, and sizing that actually fits. No hype for hype’s sake—just elevated staples that earn a spot in your rotation.'
  },
  {
    title: 'Who it’s for',
    body: 'People who value feel over flash. Creatives, travelers, founders, anyone who wants luxury that doesn’t need a logo to be seen.'
  }
];

const highlights = [
  'Small-batch production to keep quality high and waste low',
  'Fabric-first decisions: soft-hand cottons, brushed fleece, resilient blends',
  'Fit perfected on real bodies with inclusive size runs',
  'Fast, trackable shipping and no-stress returns'
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50/40 to-white">
      <Navbar />
      <div className="container-max flex-1 py-12 md:py-16 space-y-12">
        <AnimatedSection className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-green">About</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">LowKeyHigh is quiet confidence.</h1>
            <p className="text-lg text-black/70 leading-relaxed">
              Not loud logos. Not trend chasing. Just thoughtful silhouettes, premium handfeel, and a point of view rooted in optimism.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/shop" className="button-primary">Shop the drop</Link>
              <Link href="/lookbook" className="button-secondary">View the lookbook</Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            <Image
              src="https://images.pexels.com/photos/7679723/pexels-photo-7679723.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&fit=crop"
              alt="Lifestyle portrait"
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
              priority
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              Built for movement
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-soft">
              <h3 className="text-lg font-semibold mb-2">{pillar.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </AnimatedSection>

        <AnimatedSection className="rounded-3xl border border-green/20 bg-green/5 p-8 shadow-soft">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-green">Why this brand exists</p>
              <h2 className="text-2xl font-bold mt-2">Pieces you feel right in.</h2>
              <p className="text-black/70 mt-2 max-w-2xl">
                Everything we release is designed to earn your trust: fabric that drapes well, fits that flatter, and details that stay out of your way.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-black/80 max-w-lg">
              {highlights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
