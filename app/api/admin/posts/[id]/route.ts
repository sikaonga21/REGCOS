import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne, sql } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { estimateReadMinutes, slugify } from '@/lib/slug';
import type { BlogPost } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const STATUSES = ['draft', 'published', 'archived'];

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/admin/posts/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const post = await queryOne<BlogPost>('select * from blog_posts where id = $1', [id]);
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Fetch post failed:', error);
    return NextResponse.json({ error: 'Unable to load the post.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/admin/posts/[id]'>) {
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
  const content = String(body.content ?? '').trim();
  if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  if (!content) return NextResponse.json({ error: 'Post content is required.' }, { status: 400 });

  const slug = slugify(String(body.slug ?? '') || title);
  const status = STATUSES.includes(String(body.status)) ? String(body.status) : 'draft';
  const images = Array.isArray(body.featured_images)
    ? body.featured_images.map((item) => String(item)).filter(Boolean)
    : [];
  const tags = Array.isArray(body.tags) ? body.tags.map((item) => String(item).trim()).filter(Boolean) : [];

  try {
    const existing = await queryOne<BlogPost>('select * from blog_posts where id = $1', [id]);
    if (!existing) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });

    const clash = await queryOne<{ id: string }>(
      'select id from blog_posts where slug = $1 and id <> $2',
      [slug, id]
    );
    if (clash) {
      return NextResponse.json(
        { error: `The slug "${slug}" is already used by another post.` },
        { status: 409 }
      );
    }

    const rows = await query<BlogPost>(
      `update blog_posts set
         title = $2, slug = $3, excerpt = $4, content = $5, category = $6, author = $7,
         read_minutes = $8, featured_image = $9, featured_image_alt = $10,
         featured_images = $11::jsonb, tags = $12::jsonb,
         seo_title = $13, seo_description = $14, status = $15, is_featured = $16,
         published_at = case
           when $15 <> 'published' then null
           when published_at is null then now()
           else published_at
         end
       where id = $1
       returning *`,
      [
        id,
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
      ]
    );

    await recordAudit(guard.admin, 'updated post', 'blog_posts', id, title);
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update post failed:', error);
    return NextResponse.json({ error: 'Unable to update the post.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/posts/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const removed = await queryOne<{ title: string }>(
      'delete from blog_posts where id = $1 returning title',
      [id]
    );
    if (!removed) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'deleted post', 'blog_posts', id, removed.title);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete post failed:', error);
    return NextResponse.json({ error: 'Unable to delete the post.' }, { status: 500 });
  }
}

/** Lightweight status / featured toggles from the list view. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/admin/posts/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    if (typeof body.status === 'string') {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
      }
      await sql`
        update blog_posts set
          status = ${body.status},
          published_at = case
            when ${body.status} <> 'published' then null
            when published_at is null then now()
            else published_at
          end
        where id = ${id}
      `;
      await recordAudit(guard.admin, `marked post ${body.status}`, 'blog_posts', id);
    }

    if (typeof body.is_featured === 'boolean') {
      await sql`update blog_posts set is_featured = ${body.is_featured} where id = ${id}`;
      await recordAudit(
        guard.admin,
        body.is_featured ? 'featured post' : 'unfeatured post',
        'blog_posts',
        id
      );
    }

    const post = await queryOne<BlogPost>('select * from blog_posts where id = $1', [id]);
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Patch post failed:', error);
    return NextResponse.json({ error: 'Unable to update the post.' }, { status: 500 });
  }
}
