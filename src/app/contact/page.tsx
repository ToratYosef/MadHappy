import Footer from '@/components/storefront/footer';
import Navbar from '@/components/storefront/navbar';
import AnimatedSection from '@/components/ui/animated-section';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50/30 to-white">
      <Navbar />
      <div className="container-max flex-1 py-12 md:py-16 space-y-10">
        <AnimatedSection className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-green">Contact</p>
          <h1 className="text-4xl font-bold">Talk to a human.</h1>
          <p className="text-lg text-black/70">Support that responds, not a bot. Drop us a line and we’ll get back within one business day.</p>
        </AnimatedSection>

        <AnimatedSection className="grid gap-6 md:grid-cols-[1fr,1.1fr]">
          <div className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-soft space-y-4">
            <h2 className="text-xl font-semibold">Ways to reach us</h2>
            <div className="space-y-3 text-sm text-black/80">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green" />
                <a href="mailto:support@lowkeyhigh.com" className="hover:text-green transition">support@lowkeyhigh.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-green" />
                <a href="https://instagram.com" className="hover:text-green transition" target="_blank" rel="noreferrer">Instagram</a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green" />
                <span>Los Angeles, CA</span>
              </div>
            </div>
          </div>

          <form className="rounded-2xl border border-black/5 bg-white/90 p-6 shadow-soft space-y-4">
            <h2 className="text-xl font-semibold">Send a note</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black/70" htmlFor="name">Name</label>
                <input id="name" name="name" className="w-full rounded-lg border border-black/10 px-3 py-2" placeholder="Your name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-black/70" htmlFor="email">Email</label>
                <input id="email" name="email" className="w-full rounded-lg border border-black/10 px-3 py-2" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-black/70" htmlFor="order">Order # (optional)</label>
              <input id="order" name="order" className="w-full rounded-lg border border-black/10 px-3 py-2" placeholder="e.g., LKH12345" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-black/70" htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={4} className="w-full rounded-lg border border-black/10 px-3 py-2" placeholder="What can we help with?" />
            </div>
            <button type="submit" className="button-primary w-full">Send message</button>
          </form>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
