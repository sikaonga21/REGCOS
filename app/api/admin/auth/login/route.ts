import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { isDatabaseConfigured, queryOne, sql } from '@/lib/db/client';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session';
import { recordAudit } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

/**
 * Per-instance throttle. Serverless means this is not a global counter, but it
 * still blunts credential stuffing against any single warm instance, and costs
 * nothing.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function throttled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

type AdminRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  password_hash: string;
};

/**
 * Lets the very first account be created from environment variables, so a fresh
 * Vercel deployment can be signed into without shell access to the database.
 * Only fires when `admin_users` is empty and the submitted credentials match the
 * configured bootstrap pair exactly.
 */
async function bootstrapFirstAdmin(email: string, password: string): Promise<AdminRow | null> {
  const bootstrapEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_PASSWORD || '';

  if (!bootstrapEmail || !bootstrapPassword) return null;
  if (email !== bootstrapEmail || password !== bootstrapPassword) return null;

  const existing = await queryOne<{ count: number }>('select count(*)::int as count from admin_users');
  if ((existing?.count ?? 0) > 0) return null;

  const rows = await sql`
    insert into admin_users (email, name, password_hash, role)
    values (${email}, ${email.split('@')[0]}, ${await hashPassword(password)}, 'owner')
    returning id, email, name, role, active, password_hash
  `;

  return (rows[0] as AdminRow) ?? null;
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      {
        error:
          'Database not connected. Add a Vercel Postgres store, set POSTGRES_URL, then run "npm run db:setup".',
        code: 'DB_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (throttled(ip)) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Try again in a few minutes.' },
      { status: 429 }
    );
  }

  let email = '';
  let password = '';
  try {
    const body = await request.json();
    email = String(body?.email ?? '').trim().toLowerCase();
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  try {
    let admin = await queryOne<AdminRow>(
      'select id, email, name, role, active, password_hash from admin_users where email = $1',
      [email]
    );

    let authenticated = false;

    if (admin) {
      authenticated = admin.active && (await verifyPassword(password, admin.password_hash));
    } else {
      admin = await bootstrapFirstAdmin(email, password);
      authenticated = Boolean(admin);
    }

    if (!admin || !authenticated) {
      recordAttempt(ip);
      // Deliberately identical for unknown email, wrong password, and disabled
      // account, so the response cannot be used to enumerate users.
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(admin.id, {
      userAgent: request.headers.get('user-agent') ?? '',
      ip,
    });

    await sql`update admin_users set last_login_at = now() where id = ${admin.id}`;
    await recordAudit(admin, 'signed in', 'session', admin.id, ip);

    attempts.delete(ip);
    (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));

    return NextResponse.json({
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      {
        error:
          'Could not reach the database. Confirm POSTGRES_URL is set and "npm run db:setup" has been run.',
      },
      { status: 500 }
    );
  }
}
