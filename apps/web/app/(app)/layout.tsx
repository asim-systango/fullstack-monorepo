import { ProtectedLayout } from '@/components/splitter/protected-layout';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
