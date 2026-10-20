import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { isBlobConfigured, listBlobs, normaliseFolder } from '@/lib/blob';

export const dynamic = 'force-dynamic';

/**
 * Reconciles the media table with what is actually in the Blob store, so files
 * uploaded from the Vercel dashboard or the CLI show up in the library. Walks
 * the full store via the pagination cursor.
 */
export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  if (!isBlobConfigured) {
    return NextResponse.json(
      { error: 'Vercel Blob is not connected.', code: 'BLOB_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  try {
    let cursor: string | undefined;
    let imported = 0;
    let seen = 0;

    // Bounded so a very large store cannot run the function past its timeout.
    for (let page = 0; page < 20; page += 1) {
      const result = await listBlobs({ limit: 500, cursor });

      for (const blob of result.blobs) {
        seen += 1;
        const filename = blob.pathname.split('/').pop() ?? blob.pathname;
        const folder = normaliseFolder(blob.pathname.split('/')[0]);

        const rows = await sql`
          insert into media_assets (url, pathname, filename, content_type, size_bytes, folder, uploaded_by)
          values (${blob.url}, ${blob.pathname}, ${filename}, ${''}, ${blob.size ?? 0}, ${folder}, ${guard.admin.id})
          on conflict (url) do nothing
          returning id
        `;
        if (rows.length > 0) imported += 1;
      }

      if (!result.hasMore || !result.cursor) break;
      cursor = result.cursor;
    }

    await recordAudit(guard.admin, 'synced blob store', 'media_assets', '', `${imported} new of ${seen}`);
    return NextResponse.json({ ok: true, imported, seen });
  } catch (error) {
    console.error('Blob sync failed:', error);
    return NextResponse.json({ error: 'Unable to sync the Blob store.' }, { status: 500 });
  }
}
