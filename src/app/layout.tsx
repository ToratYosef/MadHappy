import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import PageTransition from '@/components/ui/page-transition';
import CartDrawer from '@/components/cart-drawer';
import { Providers } from '@/components/providers';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-primary', display: 'swap' });

export const metadata: Metadata = {
  title: 'low key high | Minimal premium essentials',
  description: 'Understated luxury essentials for everyday elevation.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className={cn('bg-background text-foreground antialiased min-h-screen', font.className)}>
        <Providers>
          <PageTransition>
            <main className="min-h-screen flex flex-col">{children}</main>
          </PageTransition>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
