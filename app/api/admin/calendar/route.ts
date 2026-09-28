import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .order('start_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to fetch calendar events.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.start_at) {
      return NextResponse.json(
        { error: 'Title and start_at are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .insert([
        {
          title: body.title,
          slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: body.description || '',
          location: body.location || '',
          start_at: body.start_at,
          end_at: body.end_at || body.start_at,
          all_day: Boolean(body.all_day),
          event_type: body.event_type || 'school',
          status: body.status || 'scheduled',
          color: body.color || '#FFD400',
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create calendar event.' }, { status: 500 });
  }
}
