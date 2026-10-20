import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/guard';
import { paginated, parseListParams } from '@/lib/db/list-params';
import type { Enrollment } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const SORTABLE = ['created_at', 'updated_at', 'child_name', 'status', 'start_date'] as const;
const STATUSES = ['new', 'reviewing', 'accepted', 'waitlist', 'declined'];

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const params = parseListParams(url, { sortable: SORTABLE, defaultSort: 'created_at' });

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.search) {
    values.push(`%${params.search}%`);
    conditions.push(
      `(child_name ilike $${values.length}
        or guardian_name ilike $${values.length}
        or email ilike $${values.length}
        or phone ilike $${values.length})`
    );
  }
  if (STATUSES.includes(params.status)) {
    values.push(params.status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

  try {
    const totals = await queryOne<{ count: number }>(
      `select count(*)::int as count from enrollments ${where}`,
      values
    );

    const rows = await query<Enrollment>(
      `select * from enrollments ${where}
        order by ${params.sortColumn} ${params.sortDirection}
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, params.pageSize, params.offset]
    );

    const byStatus = await query<{ status: string; count: number }>(
      'select status, count(*)::int as count from enrollments group by status'
    );

    return NextResponse.json({
      ...paginated(rows, totals?.count ?? 0, params),
      counts: Object.fromEntries(byStatus.map((row) => [row.status, row.count])),
    });
  } catch (error) {
    console.error('List enrollments failed:', error);
    return NextResponse.json({ error: 'Unable to load enrollment applications.' }, { status: 500 });
  }
}
