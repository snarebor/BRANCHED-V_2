import type { Metadata } from 'next';
import { Manrope, Inter, Noto_Sans  } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-notosans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Branched — Classifieds you can trust',
  description:
    'A structured, searchable marketplace for housing, jobs, goods, services, vehicles, and community — built to replace scam-prone Telegram group chats.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} ${notoSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
         <Toaster />
      </body>
    </html>
  );
}
