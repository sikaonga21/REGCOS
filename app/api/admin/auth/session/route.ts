import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db/client';
import { getCurrentAdmin, listSessions } from '@/lib/auth/session';
import { isBlobConfigured } from '@/lib/blob';

export const dynamic = 'force-dynamic';

/** Used by the admin shell to render the current user and connection health. */
export async function GET() {
  const admin = await getCurrentAdmin();

  return NextResponse.json({
    admin,
    sessions: admin ? await listSessions(admin.id) : [],
    connection: {
      database: isDatabaseConfigured,
      blob: isBlobConfigured,
    },
  });
}
