import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { galleryCategories } from '@/lib/gallery';
import type { GalleryPhotoRow } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/admin/gallery/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const src = String(body.src ?? '').trim();
  if (!src) return NextResponse.json({ error: 'An image is required.' }, { status: 400 });

  const category = galleryCategories.includes(String(body.category) as never)
    ? String(body.category)
    : 'Classrooms';

  try {
    const rows = await query<GalleryPhotoRow>(
      `update gallery_photos set
         src = $2, alt = $3, caption = $4, category = $5,
         width = $6, height = $7, published = $8, highlight = $9
       where id = $1
       returning *`,
      [
        id,
        src,
        String(body.alt ?? '').trim(),
        String(body.caption ?? '').trim(),
        category,
        Number(body.width) || 1920,
        Number(body.height) || 1280,
        body.published === undefined ? true : Boolean(body.published),
        Boolean(body.highlight),
      ]
    );

    if (rows.length === 0) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'updated gallery photo', 'gallery_photos', id, category);
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update gallery photo failed:', error);
    return NextResponse.json({ error: 'Unable to update the photo.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/gallery/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const removed = await queryOne<{ caption: string }>(
      'delete from gallery_photos where id = $1 returning caption',
      [id]
    );
    if (!removed) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'removed gallery photo', 'gallery_photos', id, removed.caption);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete gallery photo failed:', error);
    return NextResponse.json({ error: 'Unable to remove the photo.' }, { status: 500 });
  }
}
