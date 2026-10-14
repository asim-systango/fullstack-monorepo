import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/app-header';
import { AppProviders } from '@/components/providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Job Portal',
  description: 'Find jobs, hire talent, manage applications',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          <AppHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
