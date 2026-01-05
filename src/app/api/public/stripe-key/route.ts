import { NextResponse } from 'next/server';

const STRIPE_PUBLISHABLE_KEY_ENV = 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Access via a computed key to avoid bundling the actual value at build time
  const publishableKey = process.env[STRIPE_PUBLISHABLE_KEY_ENV];

  if (!publishableKey) {
    return NextResponse.json({ error: 'Stripe publishable key is not configured.' }, { status: 500 });
  }

  return NextResponse.json({ publishableKey });
}
