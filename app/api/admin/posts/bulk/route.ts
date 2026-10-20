import { NextResponse, type NextRequest } from 'next/server';
import { query } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

const ACTIONS = ['publish', 'draft', 'archive', 'feature', 'unfeature', 'delete'] as const;
type BulkAction = (typeof ACTIONS)[number];

/** Applies one action to many posts in a single round trip. */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const action = String(body.action ?? '') as BulkAction;
  const ids = Array.isArray(body.ids) ? body.ids.map((id) => String(id)).filter(Boolean) : [];

  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Unknown bulk action.' }, { status: 400 });
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Select at least one post.' }, { status: 400 });
  }
  if (action === 'delete' && guard.admin.role === 'editor') {
    return NextResponse.json({ error: 'Editors cannot bulk delete posts.' }, { status: 403 });
  }

  try {
    let affected: Array<{ id: string }> = [];

    if (action === 'delete') {
      affected = await query<{ id: string }>('delete from blog_posts where id = any($1::uuid[]) returning id', [
        ids,
      ]);
    } else if (action === 'feature' || action === 'unfeature') {
      affected = await query<{ id: string }>(
        'update blog_posts set is_featured = $2 where id = any($1::uuid[]) returning id',
        [ids, action === 'feature']
      );
    } else {
      const status = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : 'archived';
      affected = await query<{ id: string }>(
        `update blog_posts set
           status = $2,
           published_at = case
             when $2 <> 'published' then null
             when published_at is null then now()
             else published_at
           end
         where id = any($1::uuid[])
         returning id`,
        [ids, status]
      );
    }

    await recordAudit(
      guard.admin,
      `bulk ${action}`,
      'blog_posts',
      '',
      `${affected.length} post(s)`
    );

    return NextResponse.json({ ok: true, affected: affected.length });
  } catch (error) {
    console.error('Bulk post action failed:', error);
    return NextResponse.json({ error: 'Unable to apply that action.' }, { status: 500 });
  }
}
