import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-gradient-to-b from-white to-slate-50/70">
      <div className="container-max py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Image src="/logo.png" alt="Low Key High" width={140} height={45} className="h-10 w-auto" />
            <p className="text-sm text-black/60 leading-relaxed">
              Understated luxury essentials for everyday elevation. Quality pieces that speak softly but carry confidence.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">Shop</h3>
            <ul className="space-y-2 text-sm text-black/70">
              <li><Link href="/shop" className="hover:text-green transition">All Products</Link></li>
              <li><Link href="/#featured" className="hover:text-green transition">Featured</Link></li>
              <li><Link href="/shop" className="hover:text-green transition">New Arrivals</Link></li>
              <li><Link href="/shop" className="hover:text-green transition">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">Support</h3>
            <ul className="space-y-2 text-sm text-black/70">
              <li><Link href="/help" className="hover:text-green transition">Help Center</Link></li>
              <li><Link href="/track-order" className="hover:text-green transition">Track Order</Link></li>
              <li><Link href="/help" className="hover:text-green transition">Shipping Info</Link></li>
              <li><Link href="/help" className="hover:text-green transition">Returns</Link></li>
              <li><Link href="/help" className="hover:text-green transition">Size Guide</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@lowkeyhigh.com" className="hover:text-green transition">
                  hello@lowkeyhigh.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Los Angeles, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-black/5 pt-8 text-xs text-black/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} low key high. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/help" className="hover:text-black/70 transition">Privacy Policy</Link>
            <Link href="/help" className="hover:text-black/70 transition">Terms of Service</Link>
            <Link href="/help" className="hover:text-black/70 transition">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
