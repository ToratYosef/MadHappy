import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "low key high — minimal streetwear",
  description: "Premium minimal e-commerce for low key high."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-ink antialiased">
        <SmoothScrollProvider>
          <div className="mx-auto flex max-w-6xl flex-col px-5 sm:px-8">
            <Header />
            {children}
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
