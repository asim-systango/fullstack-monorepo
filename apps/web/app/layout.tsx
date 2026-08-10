import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

/**
 * Inter font — Google Fonts se load ho raha hai.
 * `variable` option se hum CSS variable bana rahe hain: --font-inter
 * Ye variable globals.css mein body font ke roop mein use hoga.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * Next.js metadata — browser tab title aur SEO ke liye.
 */
export const metadata: Metadata = {
  title: {
    template: '%s | CRM', // Har page apna title set karega, ye suffix lagega
    default: 'CRM Platform',
  },
  description: 'Multi-tenant CRM platform for managing organizations and teams.',
};

/**
 * RootLayout — ye poore app ka wrapper hai.
 * Har page automatically iske andar render hoga.
 *
 * `suppressHydrationWarning` — Server aur client ke beech
 * chhote HTML differences ko ignore karta hai (Next.js best practice).
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
