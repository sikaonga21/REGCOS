import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { buildPlaceholderBlogPosts } from '@/lib/blog-placeholder-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return NextResponse.json({ data, source: 'supabase' });
    }

    return NextResponse.json({
      data: buildPlaceholderBlogPosts(),
      source: 'placeholder',
    });
  } catch (error) {
    return NextResponse.json({
      data: buildPlaceholderBlogPosts(),
      source: 'placeholder',
      message: 'Supabase not configured yet. Using placeholder blog data.',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required.' },
        { status: 400 }
      );
    }

    const featuredImages = Array.isArray(body.featured_images)
      ? body.featured_images.filter(Boolean)
      : (body.featured_image ? [body.featured_image] : []);

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([
        {
          title: body.title,
          slug: body.slug,
          excerpt: body.excerpt || '',
          content: body.content,
          category_id: body.category_id || null,
          featured_image: featuredImages[0] || body.featured_image || null,
          featured_image_alt: body.featured_image_alt || body.title,
          featured_images: featuredImages,
          status: body.status || 'draft',
          is_featured: Boolean(body.is_featured),
          published_at: body.status === 'published' ? new Date().toISOString() : null,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, source: 'supabase' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to create blog post.' }, { status: 500 });
  }
}
