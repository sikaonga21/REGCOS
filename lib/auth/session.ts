import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { isDatabaseConfigured, query, queryOne, sql } from '@/lib/db/client';

export const SESSION_COOKIE = 'regcos_admin_session';
const SESSION_DAYS = 7;

export type AdminRole = 'owner' | 'admin' | 'editor';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
};

/**
 * Session tokens are opaque random strings. Only their SHA-256 digest is stored,
 * so a database leak does not hand over working sessions.
 */
function digest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string; ip?: string } = {}
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await sql`
    insert into admin_sessions (user_id, token_hash, user_agent, ip, expires_at)
    values (${userId}, ${digest(token)}, ${meta.userAgent ?? ''}, ${meta.ip ?? ''}, ${expiresAt.toISOString()})
  `;

  // Opportunistic cleanup so the table does not grow without bound.
  await sql`delete from admin_sessions where expires_at < now()`;

  return { token, expiresAt };
}

/** Reads the signed-in admin for the current request, or null. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (!isDatabaseConfigured) return null;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await queryOne<AdminUser>(
      `select u.id, u.email, u.name, u.role, u.active, u.last_login_at, u.created_at
         from admin_sessions s
         join admin_users u on u.id = s.user_id
        where s.token_hash = $1
          and s.expires_at > now()
          and u.active = true`,
      [digest(token)]
    );
  } catch {
    return null;
  }
}

export async function destroyCurrentSession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !isDatabaseConfigured) return;
  try {
    await sql`delete from admin_sessions where token_hash = ${digest(token)}`;
  } catch {
    // A failed delete still clears the cookie; the row expires on its own.
  }
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await sql`delete from admin_sessions where user_id = ${userId}`;
}

export async function listSessions(userId: string) {
  return query<{ id: string; user_agent: string; ip: string; created_at: string; expires_at: string }>(
    `select id, user_agent, ip, created_at, expires_at
       from admin_sessions
      where user_id = $1 and expires_at > now()
      order by created_at desc`,
    [userId]
  );
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

/** Roles that may change other users, settings, and destructive operations. */
export function canManage(role: AdminRole): boolean {
  return role === 'owner' || role === 'admin';
}
