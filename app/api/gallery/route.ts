import { NextResponse } from 'next/server';
import { isDatabaseConfigured, query } from '@/lib/db/client';
import { galleryPhotos } from '@/lib/gallery';
import type { GalleryPhotoRow } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

/**
 * Published gallery photos. An empty or unreachable table falls back to the
 * bundled photo set, so the public gallery is never blank.
 */
export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ data: galleryPhotos, source: 'bundled' });
  }

  try {
    const rows = await query<GalleryPhotoRow>(
      `select src, alt, caption, category, width, height, highlight
         from gallery_photos
        where published = true
        order by sort_order asc, created_at asc`
    );

    if (rows.length === 0) {
      return NextResponse.json({ data: galleryPhotos, source: 'bundled' });
    }

    return NextResponse.json({ data: rows, source: 'database' });
  } catch (error) {
    console.error('Public gallery read failed:', error);
    return NextResponse.json({ data: galleryPhotos, source: 'bundled' });
  }
}
