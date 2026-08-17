'use client';

import { useParams } from 'next/navigation';
import { GroupBalancesView } from '@/components/splitter';

export default function GroupBalancesPage() {
  const params = useParams<{ id: string }>();
  return <GroupBalancesView groupId={params.id} showBackLink />;
}
