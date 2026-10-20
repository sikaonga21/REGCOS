import { NextResponse, type NextRequest } from 'next/server';
import { query } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

/**
 * Persists a drag-and-drop reorder. The client sends the ids in their new order
 * and we rewrite sort_order in one statement using the array index.
 */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.map((id) => String(id)).filter(Boolean) : [];
  if (ids.length === 0) return NextResponse.json({ error: 'No photos to reorder.' }, { status: 400 });

  try {
    const updated = await query<{ id: string }>(
      `update gallery_photos as g
          set sort_order = ordered.position * 10
         from (
           select id, (row_number() over ())::int as position
             from unnest($1::uuid[]) as id
         ) as ordered
        where g.id = ordered.id
       returning g.id`,
      [ids]
    );

    await recordAudit(guard.admin, 'reordered gallery', 'gallery_photos', '', `${updated.length} photo(s)`);
    return NextResponse.json({ ok: true, affected: updated.length });
  } catch (error) {
    console.error('Reorder gallery failed:', error);
    return NextResponse.json({ error: 'Unable to save the new order.' }, { status: 500 });
  }
}
