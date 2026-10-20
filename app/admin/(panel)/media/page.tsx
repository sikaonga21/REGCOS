'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowsClockwise,
  Copy,
  HardDrives,
  ImageSquare,
  MagnifyingGlass,
  Trash,
} from 'phosphor-react';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorNotice,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  SkeletonRows,
  formatBytes,
  useDebounced,
  useToast,
} from '@/components/admin/ui';
import { UploadDropzone, type MediaFolderName } from '@/components/admin/MediaPicker';
import { formatDateTime } from '@/lib/dates';
import type { MediaAsset } from '@/lib/db/types';

const FOLDERS: MediaFolderName[] = ['uploads', 'blog', 'gallery', 'events', 'branding'];

export default function MediaPage() {
  const toast = useToast();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [bytes, setBytes] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [blobConnected, setBlobConnected] = useState(true);
  const pageSize = 24;

  const [folder, setFolder] = useState<string>('all');
  const [uploadFolder, setUploadFolder] = useState<MediaFolderName>('uploads');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      folder,
    });
    if (debouncedSearch) params.set('q', debouncedSearch);

    try {
      const response = await fetch(`/api/admin/media?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load the media library.');
      } else {
        setAssets(result.data ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(result.totalPages ?? 1);
        setBytes(result.bytes ?? 0);
        setBlobConnected(result.blobConnected !== false);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, folder, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [folder, debouncedSearch]);

  const sync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/media/sync', { method: 'POST' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not sync the Blob store.', 'error');
      } else {
        toast.push(
          result.imported > 0
            ? `${result.imported} new file${result.imported === 1 ? '' : 's'} imported from Vercel Blob.`
            : 'Already up to date with Vercel Blob.'
        );
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const copyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.push('URL copied to the clipboard.');
    } catch {
      toast.push('Your browser blocked clipboard access.', 'error');
    }
  };

  const saveAsset = async (asset: MediaAsset, alt: string, nextFolder: string) => {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id, alt, folder: nextFolder }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not save the file details.', 'error');
      } else {
        toast.push('File details saved.');
        setEditing(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/media?id=${deleting.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not delete the file.', 'error');
      } else {
        toast.push('File deleted from Vercel Blob.');
        setDeleting(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storage"
        title="Media library"
        description="Every image on the site, stored in your Vercel Blob store."
        actions={
          <Button variant="outline" onClick={() => void sync()} loading={syncing}>
            <ArrowsClockwise size={16} />
            Sync from Blob
          </Button>
        }
      />

      {!blobConnected ? (
        <div className="mb-6 flex flex-wrap items-start gap-3 rounded-2xl border border-secondary/60 bg-secondary/15 px-4 py-3.5">
          <HardDrives size={20} className="mt-0.5 shrink-0 text-[#7a5c00]" />
          <div className="min-w-0 flex-1 text-sm text-slate-700">
            <p className="font-semibold text-primary-dark">Vercel Blob is not connected</p>
            <p className="mt-0.5">
              In your Vercel project, open <strong>Storage → Create → Blob</strong>, then run{' '}
              <code className="rounded bg-white/70 px-1 py-px font-mono text-xs">vercel env pull .env.local</code>{' '}
              so <code>BLOB_READ_WRITE_TOKEN</code> is available here.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-semibold text-primary-dark">
                Upload images
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Files go straight from your browser to Vercel Blob, so large images are fine.
              </p>
            </div>
            <Field label="Folder" className="w-40">
              <Select
                value={uploadFolder}
                onChange={(event) => setUploadFolder(event.target.value as MediaFolderName)}
              >
                {FOLDERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <UploadDropzone
            folder={uploadFolder}
            onUploaded={() => {
              setPage(1);
              void load();
            }}
          />
        </Card>

        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
            <div>
              <p className="font-heading text-sm font-semibold text-primary-dark">
                {total} file{total === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-slate-500">{formatBytes(bytes)} stored</p>
            </div>

            <div className="relative ml-auto min-w-48 flex-1 sm:max-w-xs">
              <MagnifyingGlass
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search file names…"
                className="pl-9"
                aria-label="Search media"
              />
            </div>

            <Select
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              className="w-auto"
              aria-label="Filter by folder"
            >
              <option value="all">All folders</option>
              {FOLDERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>

          <div className="p-4 sm:p-5">
            {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

            {loading ? (
              <SkeletonRows rows={4} />
            ) : assets.length === 0 ? (
              <EmptyState
                icon={<ImageSquare size={22} />}
                title={search ? 'No files match that search' : 'No files yet'}
                description={
                  search
                    ? 'Try a different file name.'
                    : 'Upload an image above, or use "Sync from Blob" to import files already in your store.'
                }
              />
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {assets.map((asset) => (
                    <li
                      key={asset.id}
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setEditing(asset)}
                        className="block w-full bg-slate-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.alt || asset.filename}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover transition group-hover:opacity-90"
                        />
                      </button>

                      <div className="p-2.5">
                        <p className="truncate text-xs font-medium text-slate-700" title={asset.filename}>
                          {asset.filename}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-1">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <Badge tone="slate">{asset.folder}</Badge>
                            <span className="truncate text-[11px] text-slate-400">
                              {formatBytes(asset.size_bytes)}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center">
                            <IconButton label="Copy URL" onClick={() => void copyUrl(asset)}>
                              <Copy size={14} />
                            </IconButton>
                            <IconButton
                              label="Delete file"
                              onClick={() => setDeleting(asset)}
                              className="text-accent hover:bg-accent/10"
                            >
                              <Trash size={14} />
                            </IconButton>
                          </span>
                        </div>
                        {!asset.alt ? (
                          <p className="mt-1.5 text-[11px] font-medium text-[#7a5c00]">
                            No description set
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </Card>
      </div>

      {editing ? (
        <AssetDetail
          asset={editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSave={(alt, nextFolder) => void saveAsset(editing, alt, nextFolder)}
          onDelete={() => setDeleting(editing)}
          onCopy={() => void copyUrl(editing)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this file?"
        message={`“${deleting?.filename ?? ''}” will be removed from Vercel Blob. Any page still pointing at it will show a broken image.`}
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function AssetDetail({
  asset,
  busy,
  onClose,
  onSave,
  onDelete,
  onCopy,
}: {
  asset: MediaAsset;
  busy: boolean;
  onClose: () => void;
  onSave: (alt: string, folder: string) => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const [alt, setAlt] = useState(asset.alt ?? '');
  const [folder, setFolder] = useState(asset.folder ?? 'uploads');

  return (
    <Modal
      open
      onClose={onClose}
      title={asset.filename}
      description={`Uploaded ${formatDateTime(asset.created_at)} · ${formatBytes(asset.size_bytes)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onDelete} className="mr-auto text-accent hover:bg-accent/10">
            <Trash size={15} />
            Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(alt, folder)} loading={busy}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.url} alt={alt || asset.filename} className="max-h-72 w-full object-contain" />
        </div>

        <Field
          label="Image description"
          hint="Read aloud by screen readers and shown if the image fails to load."
        >
          <Input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Pupils playing recorders in the music room"
          />
        </Field>

        <Field label="Folder">
          <Select value={folder} onChange={(event) => setFolder(event.target.value)}>
            {FOLDERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Public URL">
          <div className="flex gap-2">
            <Input value={asset.url} readOnly className="font-mono text-xs" />
            <Button variant="outline" onClick={onCopy}>
              <Copy size={15} />
              Copy
            </Button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}
