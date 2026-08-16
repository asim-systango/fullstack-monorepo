import { StaffCompanyGate } from '@/components/staff/staff-company-gate';

export default function CompanyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StaffCompanyGate>{children}</StaffCompanyGate>;
}
