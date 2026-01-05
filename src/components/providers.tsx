'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AuthModal } from './storefront/auth-modal';

function AuthModalWrapper() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  return <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <AuthProvider>
        {children}
        <AuthModalWrapper />
      </AuthProvider>
    </SessionProvider>
  );
}
