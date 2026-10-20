import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroyCurrentSession, getCurrentAdmin, SESSION_COOKIE } from '@/lib/auth/session';
import { recordAudit } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

export async function POST() {
  const admin = await getCurrentAdmin();
  await destroyCurrentSession();

  if (admin) {
    await recordAudit(admin, 'signed out', 'session', admin.id);
  }

  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
