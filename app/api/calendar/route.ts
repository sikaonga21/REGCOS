import { NextResponse } from 'next/server';
import { isDatabaseConfigured, query } from '@/lib/db/client';
import type { CalendarEvent } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

/** Scheduled and completed events for the public calendar page. */
export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ data: [], source: 'placeholder' });
  }

  try {
    const data = await query<CalendarEvent>(
      `select id, title, slug, description, location, start_at, end_at,
              all_day, event_type, status, color
         from calendar_events
        where status <> 'cancelled'
        order by start_at asc`
    );

    return NextResponse.json({ data, source: 'database' });
  } catch (error) {
    console.error('Public calendar read failed:', error);
    return NextResponse.json({ data: [], source: 'placeholder' });
  }
}
