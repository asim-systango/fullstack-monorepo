import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Job Portal',
  description: 'LinkedIn-inspired job portal',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
