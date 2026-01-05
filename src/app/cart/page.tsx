'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '@/components/storefront/navbar';
import StickyPromoBannerClient from '@/components/storefront/sticky-promo-banner-client';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<string>('');
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [promoFreeShipping, setPromoFreeShipping] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [taxCents, setTaxCents] = useState(0);

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

  // Calculate tax when zip code or state changes
  useEffect(() => {
    if ((form.postal || form.state) && subtotal > 0) {
      fetch('/api/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subtotalCents: subtotal - promoDiscountAmount, 
          zipCode: form.postal,
          state: form.state 
        })
      })
        .then(res => res.json())
        .then(data => setTaxCents(data.taxCents || 0))
        .catch(() => setTaxCents(0));
    } else {
      setTaxCents(0);
    }
  }, [form.postal, form.state, subtotal, promoDiscountAmount]);

  const shippingCents = promoFreeShipping ? 0 : 0; // Set actual shipping cost here
  const totalCents = subtotal - promoDiscountAmount + taxCents + shippingCents;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage('Please enter a promo code');
      return;
    }

    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase(), subtotalCents: subtotal })
      });

      const data = await res.json();
      if (res.ok) {
        setPromoType(data.type);
        setPromoDiscountAmount(data.discountAmount || 0);
        setPromoFreeShipping(data.freeShipping || false);
        
        let message = `Promo code applied!`;
        if (data.type === 'PERCENTAGE') {
          message += ` ${data.discount}% off`;
        } else if (data.type === 'FLAT_AMOUNT') {
          message += ` $${(data.discountAmount / 100).toFixed(2)} off`;
        } else if (data.type === 'FREE_SHIPPING') {
          message += ` Free shipping`;
        } else if (data.type === 'TIERED') {
          message += ` $${(data.discountAmount / 100).toFixed(2)} off`;
        }
        setPromoMessage(message);
      } else {
        setPromoDiscountAmount(0);
        setPromoFreeShipping(false);
        setPromoMessage(data.error || 'Invalid promo code');
      }
    } catch (error) {
      setPromoMessage('Error validating promo code');
      setPromoDiscountAmount(0);
      setPromoFreeShipping(false);
    }
  };

  const handleCheckout = async () => {
    setError(null);
    setFieldErrors({});
    
    startTransition(async () => {
      const errors: Record<string, boolean> = {};
      
      // Validate all required fields
      if (!form.name) errors.name = true;
      if (!form.email) errors.email = true;
      if (!form.phone) errors.phone = true;
      if (!form.address1) errors.address1 = true;
      if (!form.city) errors.city = true;
      if (!form.state) errors.state = true;
      if (!form.postal) errors.postal = true;
      if (!form.country) errors.country = true;
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Please fill in all required fields: name, email, phone, address, city, state, zip code, and country.');
        
        // Scroll to first error field
        const firstErrorField = Object.keys(errors)[0];
        const element = document.querySelector(`input[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      // Validate tax has been calculated
      if (taxCents === 0) {
        setFieldErrors({ postal: true, state: true });
        setError('Please enter a valid zip code and state so we can calculate tax for your order.');
        
        // Scroll to postal field
        const postalElement = document.querySelector('input[name="postal"]');
        if (postalElement) {
          postalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
      <StickyPromoBannerClient />
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
                      Name <span className="text-red-500">*</span>
                      <input
                        name="name"
                        value={form.name}
                        onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); setFieldErrors(prev => ({ ...prev, name: false })); }}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.name ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                        required
                      />
                    </label>
                    <label className="text-sm text-black/70">
                      Email <span className="text-red-500">*</span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm((prev) => ({ ...prev, email: e.target.value })); setFieldErrors(prev => ({ ...prev, email: false })); }}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.email ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                        required
                      />
                    </label>
                  </div>
                  <label className="text-sm text-black/70">
                    Phone <span className="text-red-500">*</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={(e) => { setForm((prev) => ({ ...prev, phone: e.target.value })); setFieldErrors(prev => ({ ...prev, phone: false })); }}
                      className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.phone ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                      required
                    />
                  </label>
                  <label className="text-sm text-black/70">
                    Address line 1 <span className="text-red-500">*</span>
                    <input
                      name="address1"
                      value={form.address1}
                      onChange={(e) => { setForm((prev) => ({ ...prev, address1: e.target.value })); setFieldErrors(prev => ({ ...prev, address1: false })); }}
                      className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.address1 ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                      required
                    />
                  </label>
                  <label className="text-sm text-black/70">
                    Address line 2 (optional)
                    <input
                      name="address2"
                      value={form.address2}
                      onChange={(e) => setForm((prev) => ({ ...prev, address2: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-black/70">
                      City <span className="text-red-500">*</span>
                      <input
                        name="city"
                        value={form.city}
                        onChange={(e) => { setForm((prev) => ({ ...prev, city: e.target.value })); setFieldErrors(prev => ({ ...prev, city: false })); }}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.city ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                        required
                      />
                    </label>
                    <label className="text-sm text-black/70">
                      State / Region <span className="text-red-500">*</span>
                      <input
                        name="state"
                        value={form.state}
                        onChange={(e) => { setForm((prev) => ({ ...prev, state: e.target.value })); setFieldErrors(prev => ({ ...prev, state: false })); }}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.state ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                        placeholder="e.g., CA, California, NY, New York"
                        required
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-black/70">
                      Zip Code <span className="text-red-500">*</span>
                      <input
                        name="postal"
                        value={form.postal}
                        onChange={(e) => { setForm((prev) => ({ ...prev, postal: e.target.value })); setFieldErrors(prev => ({ ...prev, postal: false })); }}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.postal ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                        placeholder="Required for tax calculation"
                        required
                      />
                    </label>
                    <label className="text-sm text-black/70">
                      Country <span className="text-red-500">*</span>
                      <input
                        name="country"
                        value={form.country}
                        onChange={(e) => { setForm((prev) => ({ ...prev, country: e.target.value })); setFieldErrors(prev => ({ ...prev, country: false })); }}
                        className={`mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors.country ? 'border-red-500 border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-black/10'}`}
                        required
                      />
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-black/5 pt-4">
                  <label className="text-sm text-black/70">
                    Promo Code (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Enter code"
                      className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="rounded-lg bg-black/5 px-4 py-2 text-sm font-medium transition hover:bg-black/10"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-xs ${promoDiscountAmount > 0 ? 'text-green' : 'text-red-600'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {promoDiscountAmount > 0 && (
                  <div className="flex items-center justify-between py-2 text-sm text-green">
                    <span>Discount</span>
                    <span>-{formatCurrency(promoDiscountAmount)}</span>
                  </div>
                )}
                {promoFreeShipping && (
                  <div className="flex items-center justify-between py-2 text-sm text-green">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                )}
                
                {/* Tax just before Total - always show */}
                <div className="flex items-center justify-between py-2 text-sm">
                  <span>Tax {form.state && `(${form.state})`}</span>
                  <span>{taxCents > 0 ? formatCurrency(taxCents) : '--'}</span>
                </div>
                
                {/* Total at Bottom */}
                <div className="border-t border-black/10 pt-4 mt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(totalCents)}</span>
                  </div>
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
