import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { paginated, parseListParams } from '@/lib/db/list-params';
import { slugify } from '@/lib/slug';
import { parseDate } from '@/lib/dates';
import { EVENT_TYPE_COLORS, type CalendarEvent, type EventType } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const SORTABLE = ['start_at', 'created_at', 'title', 'event_type', 'status'] as const;
const EVENT_TYPES: EventType[] = ['school', 'holiday', 'event', 'meeting', 'deadline'];
const EVENT_STATUSES = ['scheduled', 'cancelled', 'completed'];

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const params = parseListParams(url, {
    sortable: SORTABLE,
    defaultSort: 'start_at',
    defaultDirection: 'asc',
  });
  const type = (url.searchParams.get('type') ?? '').trim();
  const from = parseDate(url.searchParams.get('from'));
  const to = parseDate(url.searchParams.get('to'));

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.search) {
    values.push(`%${params.search}%`);
    conditions.push(`(title ilike $${values.length} or location ilike $${values.length})`);
  }
  if (EVENT_STATUSES.includes(params.status)) {
    values.push(params.status);
    conditions.push(`status = $${values.length}`);
  }
  if (EVENT_TYPES.includes(type as EventType)) {
    values.push(type);
    conditions.push(`event_type = $${values.length}`);
  }
  if (from) {
    values.push(from);
    conditions.push(`start_at >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`start_at <= $${values.length}`);
  }

  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

  try {
    const totals = await queryOne<{ count: number }>(
      `select count(*)::int as count from calendar_events ${where}`,
      values
    );

    const rows = await query<CalendarEvent>(
      `select * from calendar_events ${where}
        order by ${params.sortColumn} ${params.sortDirection}
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, params.pageSize, params.offset]
    );

    return NextResponse.json(paginated(rows, totals?.count ?? 0, params));
  } catch (error) {
    console.error('List events failed:', error);
    return NextResponse.json({ error: 'Unable to load events.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const title = String(body.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });

  const startAt = parseDate(body.start_at);
  if (!startAt) return NextResponse.json({ error: 'A valid start date is required.' }, { status: 400 });

  const endAt = parseDate(body.end_at) ?? startAt;
  if (new Date(endAt) < new Date(startAt)) {
    return NextResponse.json({ error: 'The end date cannot be before the start date.' }, { status: 400 });
  }

  const eventType = EVENT_TYPES.includes(body.event_type as EventType)
    ? (body.event_type as EventType)
    : 'school';
  const status = EVENT_STATUSES.includes(String(body.status)) ? String(body.status) : 'scheduled';

  // Slug collisions are likely for recurring events ("sports-day"), so suffix rather than reject.
  const base = slugify(String(body.slug ?? '') || title) || 'event';
  let slug = base;

  try {
    for (let attempt = 1; attempt <= 50; attempt += 1) {
      const clash = await queryOne<{ id: string }>('select id from calendar_events where slug = $1', [slug]);
      if (!clash) break;
      slug = `${base}-${attempt + 1}`;
    }

    const rows = await query<CalendarEvent>(
      `insert into calendar_events (
         title, slug, description, location, start_at, end_at,
         all_day, event_type, status, color, created_by
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       returning *`,
      [
        title,
        slug,
        String(body.description ?? '').trim(),
        String(body.location ?? '').trim(),
        startAt,
        endAt,
        Boolean(body.all_day),
        eventType,
        status,
        String(body.color ?? '') || EVENT_TYPE_COLORS[eventType],
        guard.admin.id,
      ]
    );

    await recordAudit(guard.admin, 'created event', 'calendar_events', rows[0]?.id ?? '', title);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create event failed:', error);
    return NextResponse.json({ error: 'Unable to create the event.' }, { status: 500 });
  }
}
