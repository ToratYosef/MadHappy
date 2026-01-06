import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import CartDrawer from '@/components/cart-drawer';
import { Providers } from '@/components/providers';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-primary', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://lowkeyhigh.com'),
  title: 'LowKeyHigh | Minimal premium essentials',
  description: 'Understated luxury essentials for everyday elevation.',
  applicationName: 'LowKeyHigh',
  openGraph: {
    title: 'LowKeyHigh | Minimal premium essentials',
    description: 'Understated luxury essentials for everyday elevation.',
    url: 'https://lowkeyhigh.com',
    siteName: 'LowKeyHigh',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'LowKeyHigh minimal essentials'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LowKeyHigh | Minimal premium essentials',
    description: 'Understated luxury essentials for everyday elevation.',
    images: ['/logo.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className={cn('bg-background text-foreground antialiased min-h-screen', font.className)}>
        <Providers>
          <main className="min-h-screen flex flex-col">{children}</main>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
