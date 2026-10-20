import { NextResponse } from 'next/server';
import { isDatabaseConfigured, sql } from '@/lib/db/client';
import { canManage, getCurrentAdmin, type AdminUser } from '@/lib/auth/session';

export type GuardResult =
  | { ok: true; admin: AdminUser }
  | { ok: false; response: NextResponse };

/**
 * Gate for every `/api/admin/*` handler. Returns the signed-in admin, or the
 * response to send back. Keeping the failure as a value (rather than throwing)
 * means each handler stays a plain `async function` with no try/catch ceremony.
 */
export async function requireAdmin(options: { manage?: boolean } = {}): Promise<GuardResult> {
  if (!isDatabaseConfigured) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            'Database not connected. Add your Vercel Postgres store and set POSTGRES_URL, then run the setup script.',
          code: 'DB_NOT_CONFIGURED',
        },
        { status: 503 }
      ),
    };
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not signed in.', code: 'UNAUTHENTICATED' }, { status: 401 }),
    };
  }

  if (options.manage && !canManage(admin.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Your role does not allow this action.', code: 'FORBIDDEN' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, admin };
}

/** Appends to the audit trail. Never throws — logging must not fail a mutation. */
export async function recordAudit(
  admin: Pick<AdminUser, 'id' | 'email'> | null,
  action: string,
  entity = '',
  entityId = '',
  detail = ''
): Promise<void> {
  try {
    await sql`
      insert into audit_log (actor_id, actor_email, action, entity, entity_id, detail)
      values (${admin?.id ?? null}, ${admin?.email ?? 'system'}, ${action}, ${entity}, ${String(entityId)}, ${detail})
    `;
  } catch {
    // Intentionally silent.
  }
}
