import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/providers';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Splitter — Split expenses with friends',
  description: 'Track shared expenses, balances, and settlements — like Splitwise.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-[family-name:var(--font-inter)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
