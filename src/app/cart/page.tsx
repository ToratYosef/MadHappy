'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '@/components/storefront/navbar';
import Footer from '@/components/storefront/footer';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type CheckoutFormState = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

const defaultForm: CheckoutFormState = {
  name: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postal: '',
  country: 'US'
};

function PaymentStep({
  clientSecret,
  orderId,
  form,
  onComplete
}: {
  clientSecret: string;
  orderId: string | null;
  form: CheckoutFormState;
  onComplete: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?orderId=${orderId ?? ''}`,
        receipt_email: form.email,
        shipping: {
          name: form.name,
          phone: form.phone,
          address: {
            line1: form.address1,
            line2: form.address2,
            city: form.city,
            state: form.state,
            postal_code: form.postal,
            country: form.country
          }
        }
      }
    });

    if (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } else {
      onComplete();
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? 'Processing...' : 'Confirm and pay'}
      </button>
      <p className="text-xs text-black/60">Secure checkout with Stripe Payment Element.</p>
    </form>
  );
}

export default function CartPage() {
  const { items, updateQty, removeItem, clear } = useCartStore();
  const [form, setForm] = useState<CheckoutFormState>(defaultForm);
  const [loading, startTransition] = useTransition();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) {
      setClientSecret(null);
      setOrderId(null);
    }
  }, [items.length]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.priceCents * item.qty, 0),
    [items]
  );

  const handleCheckout = async () => {
    setError(null);
    startTransition(async () => {
      if (!form.email || !form.address1 || !form.city || !form.state || !form.postal || !form.country) {
        setError('Please fill in contact and shipping details.');
        return;
      }
      try {
        const res = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })),
            customer: { name: form.name, email: form.email, phone: form.phone },
            shipping: {
              name: form.name,
              address1: form.address1,
              address2: form.address2,
              city: form.city,
              state: form.state,
              postal: form.postal,
              country: form.country
            }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
      } catch (err: any) {
        setError(err.message || 'An error occurred. Please try again.');
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="container-max flex-1 py-10">
        <h1 className="mb-6 text-3xl font-semibold">Your cart</h1>
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {items.length === 0 && <p className="text-black/60">No items yet.</p>}
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-soft">
                {item.imageUrl && (
                  <div className="relative h-24 w-20 overflow-hidden rounded-lg border border-black/5">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.14em] text-black/50">{item.variantTitle}</p>
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.options && (
                    <p className="text-xs text-black/60">
                      {Object.entries(item.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-black/60">{formatCurrency(item.priceCents)}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <label>Qty</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={item.qty}
                      onChange={(e) => updateQty(item.variantId, Number(e.target.value))}
                      className="h-9 w-16 rounded-lg border border-black/10 bg-white px-2"
                    />
                  </div>
                </div>
                <button onClick={() => removeItem(item.variantId)} className="text-sm text-black/60 hover:text-red-500">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-xl border border-black/5 bg-white p-5 shadow-soft space-y-4">
            <h2 className="mb-3 text-xl font-semibold">Checkout</h2>
            {!clientSecret ? (
              <>
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-black/70">
                      Name
                      <input
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                        required
                      />
                    </label>
                    <label className="text-sm text-black/70">
                      Email
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                        required
                      />
                    </label>
                  </div>
                  <label className="text-sm text-black/70">
                    Phone
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-black/70">
                    Address line 1
                    <input
                      value={form.address1}
                      onChange={(e) => setForm((prev) => ({ ...prev, address1: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="text-sm text-black/70">
                    Address line 2
                    <input
                      value={form.address2}
                      onChange={(e) => setForm((prev) => ({ ...prev, address2: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-black/70">
                      City
                      <input
                        value={form.city}
                        onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                        required
                      />
                    </label>
                    <label className="text-sm text-black/70">
                      State / Region
                      <input
                        value={form.state}
                        onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                        required
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-black/70">
                      Postal code
                      <input
                        value={form.postal}
                        onChange={(e) => setForm((prev) => ({ ...prev, postal: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                        required
                      />
                    </label>
                    <label className="text-sm text-black/70">
                      Country
                      <input
                        value={form.country}
                        onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                        required
                      />
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-black/60">
                  <span>Shipping</span>
                  <span>Calculated at fulfillment</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading || items.length === 0 || !stripePromise}
                  className="button-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Processing...' : 'Proceed to payment'}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-black/5 bg-black/5 p-3 text-sm text-black/70">
                  Enter your payment details to finish the order.
                </div>
                {stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentStep clientSecret={clientSecret} orderId={orderId} form={form} onComplete={clear} />
                  </Elements>
                ) : (
                  <p className="text-sm text-red-600">Stripe publishable key is missing.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
