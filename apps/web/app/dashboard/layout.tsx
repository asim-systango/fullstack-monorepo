import { StaffCompanyGate } from '@/components/staff/staff-company-gate';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StaffCompanyGate>{children}</StaffCompanyGate>;
}
