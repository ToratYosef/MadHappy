import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import AnimatedSection from '@/components/ui/animated-section';
import Image from 'next/image';

const looks = [
  {
    title: 'Night commute',
    description: 'Layered hoodie + shell for windproof minimalism.',
    image: 'https://images.pexels.com/photos/532588/pexels-photo-532588.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1400&fit=crop'
  },
  {
    title: 'Studio break',
    description: 'Textured fleece over relaxed trousers for soft structure.',
    image: 'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1400&fit=crop'
  },
  {
    title: 'City sunrise',
    description: 'Lightweight knit, tonal layers, travel-ready carry.',
    image: 'https://images.pexels.com/photos/932405/pexels-photo-932405.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1400&fit=crop'
  },
  {
    title: 'Off-duty',
    description: 'Brushed hoodie with utility pockets and matte zips.',
    image: 'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1400&fit=crop'
  },
  {
    title: 'Airside',
    description: 'Wrinkle-resistant set built for red-eyes and lounges.',
    image: 'https://images.pexels.com/photos/1061121/pexels-photo-1061121.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1400&fit=crop'
  },
  {
    title: 'Monochrome move',
    description: 'Clean blacks with subtle contrast stitching.',
    image: 'https://images.pexels.com/photos/7679806/pexels-photo-7679806.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1400&fit=crop'
  }
];

export default function LookbookPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f6f6f6] via-white to-[#eef2f3]">
      <Navbar />
      <div className="container-max flex-1 py-12 md:py-16 space-y-10">
        <AnimatedSection className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-green">Lookbook</p>
          <h1 className="text-4xl font-bold">Lifestyle {'>'} product shots.</h1>
          <p className="text-lg text-black/70">See the pieces in motion—no prices, just the mood.</p>
        </AnimatedSection>

        <AnimatedSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look) => (
            <div key={look.title} className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft">
              <div className="relative aspect-[3/4]">
                <Image src={look.image} alt={look.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 30vw, 90vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-90" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="text-lg font-semibold">{look.title}</h3>
                <p className="text-sm text-white/80">{look.description}</p>
              </div>
            </div>
          ))}
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
