import { NextResponse } from 'next/server';
import { isDatabaseConfigured, query } from '@/lib/db/client';
import { buildPlaceholderBlogPosts } from '@/lib/blog-placeholder-data';
import type { BlogPost } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

/** Published posts for the public blog page. Falls back to placeholder content. */
export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ data: buildPlaceholderBlogPosts(), source: 'placeholder' });
  }

  try {
    const data = await query<BlogPost>(
      `select id, title, slug, excerpt, content, category, author, read_minutes,
              featured_image, featured_image_alt, featured_images, tags,
              seo_title, seo_description, is_featured, published_at, created_at
         from blog_posts
        where status = 'published'
        order by published_at desc nulls last, created_at desc`
    );

    if (data.length === 0) {
      return NextResponse.json({ data: buildPlaceholderBlogPosts(), source: 'placeholder' });
    }

    return NextResponse.json({ data, source: 'database' });
  } catch (error) {
    console.error('Public blog read failed:', error);
    return NextResponse.json({ data: buildPlaceholderBlogPosts(), source: 'placeholder' });
  }
}
