import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/lib/auth/session';
import { isDatabaseConfigured } from '@/lib/db/client';
import { isBlobConfigured } from '@/lib/blob';

/**
 * Never prerender the panel. Without this, a build that runs before the Postgres
 * store is attached short-circuits the auth check before `cookies()` is read, and
 * Next bakes the signed-out redirect into a static response that then gets served
 * to signed-in admins.
 */
export const dynamic = 'force-dynamic';

/**
 * Authoritative auth gate. `proxy.ts` only sees whether a cookie exists; this is
 * where the session is actually validated against the database.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    // An unconnected database cannot authenticate anyone, so send people to the
    // login screen, which explains what is missing.
    redirect('/admin/login');
  }

  return (
    <AdminShell
      admin={admin}
      connection={{ database: isDatabaseConfigured, blob: isBlobConfigured }}
    >
      {children}
    </AdminShell>
  );
}
