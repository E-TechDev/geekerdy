import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from '@/components/Footer';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gee Kerdy - 6IXTEEN FLAVOUR",
  description: "Discover the futuristic sound of Gee Kerdy, blending 6IXTEEN FLAVOUR with innovative music.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'Gee Kerdy - 6IXTEEN FLAVOUR',
    description: 'A premium music artist website for Gee Kerdy.',
    images: '/logo.svg',
    type: 'website',
  },
};

import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
