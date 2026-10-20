import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db/client';
import {
  ALLOWED_IMAGE_TYPES,
  isBlobConfigured,
  MAX_UPLOAD_BYTES,
  normaliseFolder,
} from '@/lib/blob';

export const dynamic = 'force-dynamic';

/**
 * Mints short-lived browser upload tokens for Vercel Blob.
 *
 * The file travels straight from the browser to Blob storage, so uploads are not
 * limited by the 4.5 MB serverless request body cap. The admin session is checked
 * inside `onBeforeGenerateToken` — without that, this route would let anyone
 * write into the store.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobConfigured) {
    return NextResponse.json(
      {
        error:
          'Vercel Blob is not connected. Create a Blob store in your Vercel project and set BLOB_READ_WRITE_TOKEN.',
        code: 'BLOB_NOT_CONFIGURED',
      },
      { status: 503 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const admin = await getCurrentAdmin();
        if (!admin) throw new Error('Not signed in.');

        let folder = 'uploads';
        try {
          folder = normaliseFolder(JSON.parse(clientPayload ?? '{}')?.folder);
        } catch {
          // Malformed payload just means the default folder.
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ adminId: admin.id, folder }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Vercel calls this webhook once the browser upload lands. It cannot reach
        // localhost, so the client also POSTs to /api/admin/media after a successful
        // upload; the unique index on url makes whichever arrives second a no-op.
        try {
          const { adminId, folder } = JSON.parse(tokenPayload ?? '{}');
          await sql`
            insert into media_assets (url, pathname, filename, content_type, size_bytes, folder, uploaded_by)
            values (
              ${blob.url},
              ${blob.pathname},
              ${blob.pathname.split('/').pop() ?? blob.pathname},
              ${blob.contentType ?? ''},
              ${'size' in blob ? Number(blob.size) || 0 : 0},
              ${folder ?? 'uploads'},
              ${adminId ?? null}
            )
            on conflict (url) do nothing
          `;
        } catch (error) {
          console.error('Recording completed upload failed:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
