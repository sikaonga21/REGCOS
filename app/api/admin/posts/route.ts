import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { paginated, parseListParams } from '@/lib/db/list-params';
import { estimateReadMinutes, slugify } from '@/lib/slug';
import type { BlogPost } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const SORTABLE = ['created_at', 'updated_at', 'published_at', 'title', 'status', 'view_count'] as const;
const STATUSES = ['draft', 'published', 'archived'];

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const params = parseListParams(url, { sortable: SORTABLE, defaultSort: 'updated_at' });
  const category = (url.searchParams.get('category') ?? '').trim();

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.search) {
    values.push(`%${params.search}%`);
    conditions.push(
      `(title ilike $${values.length} or excerpt ilike $${values.length} or slug ilike $${values.length})`
    );
  }
  if (STATUSES.includes(params.status)) {
    values.push(params.status);
    conditions.push(`status = $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

  try {
    const totals = await queryOne<{ count: number }>(
      `select count(*)::int as count from blog_posts ${where}`,
      values
    );

    const rows = await query<BlogPost>(
      `select * from blog_posts ${where}
        order by ${params.sortColumn} ${params.sortDirection} nulls last
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, params.pageSize, params.offset]
    );

    const categories = await query<{ category: string; count: number }>(
      'select category, count(*)::int as count from blog_posts group by category order by category'
    );

    return NextResponse.json({ ...paginated(rows, totals?.count ?? 0, params), categories });
  } catch (error) {
    console.error('List posts failed:', error);
    return NextResponse.json({ error: 'Unable to load posts.' }, { status: 500 });
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
  const content = String(body.content ?? '').trim();

  if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  if (!content) return NextResponse.json({ error: 'Post content is required.' }, { status: 400 });

  const slug = slugify(String(body.slug ?? '') || title);
  if (!slug) return NextResponse.json({ error: 'Could not build a URL slug from that title.' }, { status: 400 });

  const status = STATUSES.includes(String(body.status)) ? String(body.status) : 'draft';
  const images = Array.isArray(body.featured_images)
    ? body.featured_images.map((item) => String(item)).filter(Boolean)
    : [];
  const tags = Array.isArray(body.tags) ? body.tags.map((item) => String(item).trim()).filter(Boolean) : [];

  try {
    const clash = await queryOne<{ id: string }>('select id from blog_posts where slug = $1', [slug]);
    if (clash) {
      return NextResponse.json(
        { error: `The slug "${slug}" is already used by another post.` },
        { status: 409 }
      );
    }

    const rows = await query<BlogPost>(
      `insert into blog_posts (
         title, slug, excerpt, content, category, author, read_minutes,
         featured_image, featured_image_alt, featured_images, tags,
         seo_title, seo_description, status, is_featured, published_at, created_by
       ) values (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10::jsonb, $11::jsonb,
         $12, $13, $14, $15,
         case when $14 = 'published' then now() else null end, $16
       ) returning *`,
      [
        title,
        slug,
        String(body.excerpt ?? '').trim(),
        content,
        String(body.category ?? 'School News'),
        String(body.author ?? 'The Regcos Team'),
        Number(body.read_minutes) || estimateReadMinutes(content),
        images[0] || String(body.featured_image ?? '') || null,
        String(body.featured_image_alt ?? '') || title,
        JSON.stringify(images),
        JSON.stringify(tags),
        String(body.seo_title ?? ''),
        String(body.seo_description ?? ''),
        status,
        Boolean(body.is_featured),
        guard.admin.id,
      ]
    );

    await recordAudit(guard.admin, `created post`, 'blog_posts', rows[0]?.id ?? '', title);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create post failed:', error);
    return NextResponse.json({ error: 'Unable to create the post.' }, { status: 500 });
  }
}
