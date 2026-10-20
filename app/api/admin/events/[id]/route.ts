import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { parseDate } from '@/lib/dates';
import { slugify } from '@/lib/slug';
import { EVENT_TYPE_COLORS, type CalendarEvent, type EventType } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const EVENT_TYPES: EventType[] = ['school', 'holiday', 'event', 'meeting', 'deadline'];
const EVENT_STATUSES = ['scheduled', 'cancelled', 'completed'];

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/admin/events/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const event = await queryOne<CalendarEvent>('select * from calendar_events where id = $1', [id]);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    return NextResponse.json({ data: event });
  } catch (error) {
    console.error('Fetch event failed:', error);
    return NextResponse.json({ error: 'Unable to load the event.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/admin/events/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

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
  const slug = slugify(String(body.slug ?? '') || title) || 'event';

  try {
    const clash = await queryOne<{ id: string }>(
      'select id from calendar_events where slug = $1 and id <> $2',
      [slug, id]
    );
    if (clash) {
      return NextResponse.json({ error: `The slug "${slug}" is already in use.` }, { status: 409 });
    }

    const rows = await query<CalendarEvent>(
      `update calendar_events set
         title = $2, slug = $3, description = $4, location = $5,
         start_at = $6, end_at = $7, all_day = $8,
         event_type = $9, status = $10, color = $11
       where id = $1
       returning *`,
      [
        id,
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
      ]
    );

    if (rows.length === 0) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'updated event', 'calendar_events', id, title);
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update event failed:', error);
    return NextResponse.json({ error: 'Unable to update the event.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/events/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const removed = await queryOne<{ title: string }>(
      'delete from calendar_events where id = $1 returning title',
      [id]
    );
    if (!removed) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'deleted event', 'calendar_events', id, removed.title);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete event failed:', error);
    return NextResponse.json({ error: 'Unable to delete the event.' }, { status: 500 });
  }
}
