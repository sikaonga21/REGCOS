import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne, sql } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { paginated, parseListParams } from '@/lib/db/list-params';
import { deleteBlob, isBlobConfigured, isBlobUrl, normaliseFolder } from '@/lib/blob';
import type { MediaAsset } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const SORTABLE = ['created_at', 'filename', 'size_bytes'] as const;

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const params = parseListParams(url, { sortable: SORTABLE, defaultSort: 'created_at', });
  const folder = (url.searchParams.get('folder') ?? '').trim();

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.search) {
    values.push(`%${params.search}%`);
    conditions.push(`(filename ilike $${values.length} or alt ilike $${values.length})`);
  }
  if (folder && folder !== 'all') {
    values.push(normaliseFolder(folder));
    conditions.push(`folder = $${values.length}`);
  }

  const where = conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';

  try {
    const totals = await queryOne<{ count: number; bytes: string }>(
      `select count(*)::int as count, coalesce(sum(size_bytes), 0)::text as bytes
         from media_assets ${where}`,
      values
    );

    const rows = await query<MediaAsset>(
      `select * from media_assets ${where}
        order by ${params.sortColumn} ${params.sortDirection}
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, params.pageSize, params.offset]
    );

    const folders = await query<{ folder: string; count: number }>(
      'select folder, count(*)::int as count from media_assets group by folder order by folder'
    );

    return NextResponse.json({
      ...paginated(rows, totals?.count ?? 0, params),
      bytes: Number(totals?.bytes ?? 0),
      folders,
      blobConnected: isBlobConfigured,
    });
  } catch (error) {
    console.error('List media failed:', error);
    return NextResponse.json({ error: 'Unable to load the media library.' }, { status: 500 });
  }
}

/**
 * Records an asset the browser just uploaded. Vercel's `onUploadCompleted`
 * webhook cannot reach localhost, so the client reports the result here too;
 * whichever write arrives second is absorbed by `on conflict do nothing`.
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

  const url = String(body.url ?? '').trim();
  if (!url || !isBlobUrl(url)) {
    return NextResponse.json({ error: 'A Vercel Blob URL is required.' }, { status: 400 });
  }

  const pathname = String(body.pathname ?? '');

  try {
    const rows = await query<MediaAsset>(
      `insert into media_assets (url, pathname, filename, content_type, size_bytes, alt, folder, uploaded_by)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (url) do update set
         alt = case when excluded.alt <> '' then excluded.alt else media_assets.alt end
       returning *`,
      [
        url,
        pathname,
        String(body.filename ?? '') || pathname.split('/').pop() || 'file',
        String(body.content_type ?? ''),
        Number(body.size_bytes) || 0,
        String(body.alt ?? ''),
        normaliseFolder(body.folder),
        guard.admin.id,
      ]
    );

    await recordAudit(guard.admin, 'uploaded media', 'media_assets', rows[0]?.id ?? '', rows[0]?.filename ?? '');
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Record media failed:', error);
    return NextResponse.json({ error: 'Unable to save the asset.' }, { status: 500 });
  }
}

/** Updates the alt text / folder of an existing asset. */
export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ error: 'An asset id is required.' }, { status: 400 });

  try {
    const rows = await query<MediaAsset>(
      `update media_assets set
         alt = coalesce($2, alt),
         folder = coalesce($3, folder)
       where id = $1
       returning *`,
      [
        id,
        typeof body.alt === 'string' ? body.alt : null,
        typeof body.folder === 'string' ? normaliseFolder(body.folder) : null,
      ]
    );

    if (rows.length === 0) return NextResponse.json({ error: 'Asset not found.' }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update media failed:', error);
    return NextResponse.json({ error: 'Unable to update the asset.' }, { status: 500 });
  }
}

/** Deletes from Vercel Blob first, then drops the row. */
export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ error: 'An asset id is required.' }, { status: 400 });

  try {
    const asset = await queryOne<MediaAsset>('select * from media_assets where id = $1', [id]);
    if (!asset) return NextResponse.json({ error: 'Asset not found.' }, { status: 404 });

    if (isBlobConfigured && isBlobUrl(asset.url)) {
      try {
        await deleteBlob(asset.url);
      } catch (error) {
        // An already-deleted blob should not strand the database row.
        console.warn('Blob delete failed, removing record anyway:', error);
      }
    }

    await sql`delete from media_assets where id = ${id}`;
    await recordAudit(guard.admin, 'deleted media', 'media_assets', id, asset.filename);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete media failed:', error);
    return NextResponse.json({ error: 'Unable to delete the asset.' }, { status: 500 });
  }
}
