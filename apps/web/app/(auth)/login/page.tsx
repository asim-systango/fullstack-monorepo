import { LoginForm } from '@/components/auth';

// server page: reading ?next= here avoids useSearchParams, which needs a Suspense boundary to build
type LoginPageProps = Readonly<{
  searchParams: Promise<{ next?: string | string[] }>;
}>;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === 'string' ? next : null} />;
}
