import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/guard';
import type { AuditEntry } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get('pageSize') ?? '40') || 40));
  const search = (url.searchParams.get('q') ?? '').trim();

  const values: unknown[] = [];
  let where = '';
  if (search) {
    values.push(`%${search}%`);
    where = `where actor_email ilike $1 or action ilike $1 or entity ilike $1 or detail ilike $1`;
  }

  try {
    const totals = await queryOne<{ count: number }>(
      `select count(*)::int as count from audit_log ${where}`,
      values
    );

    const rows = await query<AuditEntry>(
      `select id, actor_email, action, entity, entity_id, detail, created_at
         from audit_log ${where}
        order by created_at desc
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, pageSize, (page - 1) * pageSize]
    );

    return NextResponse.json({
      data: rows,
      page,
      pageSize,
      total: totals?.count ?? 0,
      totalPages: Math.max(1, Math.ceil((totals?.count ?? 0) / pageSize)),
    });
  } catch (error) {
    console.error('Load audit log failed:', error);
    return NextResponse.json({ error: 'Unable to load the activity log.' }, { status: 500 });
  }
}
