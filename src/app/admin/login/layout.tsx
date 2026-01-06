import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | LowKeyHigh'
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
