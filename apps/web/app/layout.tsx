import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Systango CRM - Enterprise Platform',
  description: 'High-performance multi-tenant CRM application',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


