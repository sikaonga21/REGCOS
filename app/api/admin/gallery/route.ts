import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { galleryCategories } from '@/lib/gallery';
import type { GalleryPhotoRow } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const category = (new URL(request.url).searchParams.get('category') ?? '').trim();
  const filtered = galleryCategories.includes(category as never);

  try {
    const rows = await query<GalleryPhotoRow>(
      `select * from gallery_photos
        ${filtered ? 'where category = $1' : ''}
        order by sort_order asc, created_at asc`,
      filtered ? [category] : []
    );

    const counts = await query<{ category: string; count: number }>(
      'select category, count(*)::int as count from gallery_photos group by category'
    );

    return NextResponse.json({
      data: rows,
      categories: galleryCategories,
      counts: Object.fromEntries(counts.map((row) => [row.category, row.count])),
    });
  } catch (error) {
    console.error('List gallery failed:', error);
    return NextResponse.json({ error: 'Unable to load the gallery.' }, { status: 500 });
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

  const src = String(body.src ?? '').trim();
  if (!src) return NextResponse.json({ error: 'An image is required.' }, { status: 400 });

  const category = galleryCategories.includes(String(body.category) as never)
    ? String(body.category)
    : 'Classrooms';

  try {
    const next = await queryOne<{ next: number }>(
      'select coalesce(max(sort_order), 0) + 10 as next from gallery_photos'
    );

    const rows = await query<GalleryPhotoRow>(
      `insert into gallery_photos (src, alt, caption, category, width, height, sort_order, published, highlight)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning *`,
      [
        src,
        String(body.alt ?? '').trim(),
        String(body.caption ?? '').trim(),
        category,
        Number(body.width) || 1920,
        Number(body.height) || 1280,
        Number(body.sort_order) || next?.next || 10,
        body.published === undefined ? true : Boolean(body.published),
        Boolean(body.highlight),
      ]
    );

    await recordAudit(guard.admin, 'added gallery photo', 'gallery_photos', rows[0]?.id ?? '', category);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create gallery photo failed:', error);
    return NextResponse.json({ error: 'Unable to add the photo.' }, { status: 500 });
  }
}
