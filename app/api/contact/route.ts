import { NextResponse, type NextRequest } from 'next/server';
import { saveContactSubmission } from '@/lib/contact-submission';

export const dynamic = 'force-dynamic';

/**
 * Contact form submissions land in Postgres so they show up in the admin inbox
 * at /admin/messages. Previously this route discarded them.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = await saveContactSubmission(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ message: result.message, stored: true });
}
