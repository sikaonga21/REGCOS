import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/guard';
import { paginated, parseListParams } from '@/lib/db/list-params';
import type { ContactMessage } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const SORTABLE = ['created_at', 'name', 'status', 'subject'] as const;
const STATUSES = ['unread', 'read', 'replied', 'archived'];

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
      `(name ilike $${values.length}
        or email ilike $${values.length}
        or subject ilike $${values.length}
        or message ilike $${values.length})`
    );
  }
  if (STATUSES.includes(params.status)) {
    values.push(params.status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

  try {
    const totals = await queryOne<{ count: number }>(
      `select count(*)::int as count from contact_messages ${where}`,
      values
    );

    const rows = await query<ContactMessage>(
      `select * from contact_messages ${where}
        order by ${params.sortColumn} ${params.sortDirection}
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, params.pageSize, params.offset]
    );

    const byStatus = await query<{ status: string; count: number }>(
      'select status, count(*)::int as count from contact_messages group by status'
    );

    return NextResponse.json({
      ...paginated(rows, totals?.count ?? 0, params),
      counts: Object.fromEntries(byStatus.map((row) => [row.status, row.count])),
    });
  } catch (error) {
    console.error('List messages failed:', error);
    return NextResponse.json({ error: 'Unable to load messages.' }, { status: 500 });
  }
}
