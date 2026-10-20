import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import type { AdminUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const ROLES = ['owner', 'admin', 'editor'];

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const rows = await query<AdminUser & { session_count: number }>(
      `select u.id, u.email, u.name, u.role, u.active, u.last_login_at, u.created_at,
              count(s.id) filter (where s.expires_at > now())::int as session_count
         from admin_users u
         left join admin_sessions s on s.user_id = u.id
        group by u.id
        order by u.created_at asc`
    );

    return NextResponse.json({ data: rows, currentUserId: guard.admin.id });
  } catch (error) {
    console.error('List admins failed:', error);
    return NextResponse.json({ error: 'Unable to load team members.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin({ manage: true });
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const role = ROLES.includes(String(body.role)) ? String(body.role) : 'editor';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const weak = validatePasswordStrength(password);
  if (weak) return NextResponse.json({ error: weak }, { status: 400 });

  // Only an owner may mint another owner.
  if (role === 'owner' && guard.admin.role !== 'owner') {
    return NextResponse.json({ error: 'Only an owner can create another owner.' }, { status: 403 });
  }

  try {
    const existing = await queryOne<{ id: string }>('select id from admin_users where email = $1', [email]);
    if (existing) {
      return NextResponse.json({ error: 'That email already has an account.' }, { status: 409 });
    }

    const rows = await query<AdminUser>(
      `insert into admin_users (email, name, password_hash, role)
       values ($1, $2, $3, $4)
       returning id, email, name, role, active, last_login_at, created_at`,
      [email, String(body.name ?? '').trim() || email.split('@')[0], await hashPassword(password), role]
    );

    await recordAudit(guard.admin, `invited ${role}`, 'admin_users', rows[0]?.id ?? '', email);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create admin failed:', error);
    return NextResponse.json({ error: 'Unable to create that account.' }, { status: 500 });
  }
}
