'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import Link from 'next/link';

export default function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams.orderId;
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderNumber = async () => {
      try {
        // We'll fetch this from a public endpoint or just display the UUID
        // Since we need the orderNumber, let's create a simple query endpoint
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderNumber(data.orderNumber || orderId);
        } else {
          setOrderNumber(orderId);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setOrderNumber(orderId);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderNumber();
  }, [orderId]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-green">Order placed</p>
        <h1 className="text-3xl font-semibold">Thank you for your order.</h1>
        <p className="max-w-xl text-black/70">
          Your receipt and shipping details have been sent to your email. We&apos;ll let you know once it ships.
        </p>
        {!loading && orderNumber && (
          <p className="text-sm text-black/60">Order number: <span className="font-semibold text-black">{orderNumber}</span></p>
        )}
        <div className="flex gap-3">
          <Link href="/shop" className="button-primary">
            Continue shopping
          </Link>
          <Link href="/" className="button-secondary">
            Return home
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
