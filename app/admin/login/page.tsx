import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { isDatabaseConfigured } from '@/lib/db/client';
import LoginForm from './LoginForm';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentAdmin()) redirect('/admin');

  const { next } = await searchParams;

  // Only accept same-site admin paths, so `?next=` cannot be used for an open redirect.
  const safeNext = next && /^\/admin(?:[/?#]|$)/.test(next) ? next : '/admin';

  return <LoginForm next={safeNext} databaseConnected={isDatabaseConfigured} />;
}
