import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppProviders } from '@/components/providers';
import '../styles/globals.css';

const ibmPlexSans = localFont({
  src: [
    {
      path: '../fonts/IBMPlexSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/IBMPlexSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/IBMPlexSans-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = localFont({
  src: [
    {
      path: '../fonts/IBMPlexMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/IBMPlexMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Online Auction House',
  description: 'Browse, bid, and sell in the Online Auction House',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
