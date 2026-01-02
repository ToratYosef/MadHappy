'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-soft">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-black/50">Admin</p>
          <h1 className="text-2xl font-semibold">Sign in to dashboard</h1>
          <p className="text-sm text-black/60">Use your approved Google account.</p>
        </div>
        <button onClick={() => signIn('google', { callbackUrl: '/admin' })} className="button-primary w-full">
          Continue with Google
        </button>
        <div className="mt-6 text-center text-sm text-black/60">
          <Link href="/" className="text-foreground underline-offset-4 hover:underline">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
