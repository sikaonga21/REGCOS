import { del, head, list, put } from '@vercel/blob';

/**
 * Vercel Blob storage.
 *
 * `BLOB_READ_WRITE_TOKEN` is injected when a Blob store is attached to the
 * project. It is also what `handleUpload` needs in order to mint browser upload
 * tokens, so we require it rather than relying on OIDC alone.
 */
export const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const MEDIA_FOLDERS = ['uploads', 'blog', 'gallery', 'events', 'branding'] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];

/** Max size accepted from the browser. Client uploads bypass the 4.5 MB function body limit. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export class BlobNotConfiguredError extends Error {
  constructor() {
    super(
      'Vercel Blob is not connected. Create a Blob store in your Vercel project and set BLOB_READ_WRITE_TOKEN.'
    );
    this.name = 'BlobNotConfiguredError';
  }
}

export function assertBlobConfigured(): void {
  if (!isBlobConfigured) throw new BlobNotConfiguredError();
}

export function normaliseFolder(value: unknown): MediaFolder {
  return MEDIA_FOLDERS.includes(value as MediaFolder) ? (value as MediaFolder) : 'uploads';
}

/** Strips characters that would make an awkward blob pathname. */
export function safeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  return cleaned.length > 0 ? cleaned.slice(0, 120) : 'file';
}

export function blobPathname(folder: MediaFolder, filename: string): string {
  return `${folder}/${Date.now()}-${safeFilename(filename)}`;
}

/**
 * Server-side upload. Only used for small files generated on the server;
 * everything the admin picks in the browser goes through client upload so it is
 * not capped by the serverless request body limit.
 */
export async function uploadToBlob(
  folder: MediaFolder,
  filename: string,
  body: Blob | ArrayBuffer | Buffer | string,
  contentType?: string
) {
  assertBlobConfigured();
  return put(blobPathname(folder, filename), body, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function listBlobs(options: { prefix?: string; limit?: number; cursor?: string } = {}) {
  assertBlobConfigured();
  return list({
    prefix: options.prefix,
    limit: options.limit ?? 100,
    cursor: options.cursor,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function deleteBlob(urls: string | string[]) {
  assertBlobConfigured();
  return del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
}

export async function blobMetadata(url: string) {
  assertBlobConfigured();
  return head(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}

/** True for URLs served by Vercel Blob, so we know which assets we may delete. */
export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}
