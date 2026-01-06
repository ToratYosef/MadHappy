import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-gradient-to-b from-white to-slate-50/70">
      <div className="container-max py-12">
        {/* Logo & Description - Centered */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <Image src="/logo.png" alt="LowKeyHigh" width={200} height={70} className="h-16 w-auto" />
          </div>
          <p className="mx-auto max-w-md text-sm text-black/60 leading-relaxed">
            Understated luxury essentials for everyday elevation. Quality pieces that speak softly but carry confidence.
          </p>
        </div>

        {/* 3 Column Grid - All Devices */}
        <div className="grid gap-8 grid-cols-3">
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
                <a href="mailto:info@secondhandcell.com" className="hover:text-green transition">
                  Email Us
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="sms:3475591707" className="hover:text-green transition">
                  Text Us
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Brooklyn, NY</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-black/5 pt-8 text-xs text-black/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} LowKeyHigh. All rights reserved.</p>
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
