'use client';

import { upload } from '@vercel/blob/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, CloudArrowUp, ImageSquare, MagnifyingGlass } from 'phosphor-react';
import {
  Button,
  EmptyState,
  ErrorNotice,
  Input,
  Modal,
  Select,
  Spinner,
  formatBytes,
  useDebounced,
  useToast,
} from '@/components/admin/ui';
import type { MediaAsset } from '@/lib/db/types';

const FOLDERS = ['uploads', 'blog', 'gallery', 'events', 'branding'] as const;
export type MediaFolderName = (typeof FOLDERS)[number];

/** Shape Vercel Blob returns from a client upload, narrowed to what we store. */
type UploadedBlob = { url: string; pathname: string; contentType?: string };

/**
 * Uploads straight from the browser to Vercel Blob, then records the result in
 * Postgres. The recording step is done here rather than relying solely on
 * Vercel's `onUploadCompleted` webhook, because that webhook cannot reach
 * localhost during development.
 */
export function useBlobUpload(folder: MediaFolderName = 'uploads') {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<MediaAsset[]> => {
      if (files.length === 0) return [];

      setUploading(true);
      setProgress({ done: 0, total: files.length });
      const saved: MediaAsset[] = [];

      try {
        for (const [index, file] of files.entries()) {
          let blob: UploadedBlob;
          try {
            blob = (await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/admin/media/upload',
              clientPayload: JSON.stringify({ folder }),
            })) as UploadedBlob;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed.';
            toast.push(`${file.name}: ${message}`, 'error');
            continue;
          }

          const response = await fetch('/api/admin/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: blob.url,
              pathname: blob.pathname,
              filename: file.name,
              content_type: blob.contentType ?? file.type,
              size_bytes: file.size,
              folder,
            }),
          });

          const result = await response.json().catch(() => ({}));
          if (response.ok && result.data) {
            saved.push(result.data as MediaAsset);
          } else {
            // The file is in Blob storage; only the catalogue entry failed.
            toast.push(
              `${file.name} uploaded but could not be catalogued. Use "Sync from Blob" in Media.`,
              'error'
            );
          }

          setProgress({ done: index + 1, total: files.length });
        }

        if (saved.length > 0) {
          toast.push(`${saved.length} file${saved.length === 1 ? '' : 's'} uploaded.`);
        }
        return saved;
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [folder, toast]
  );

  return { uploadFiles, uploading, progress };
}

/* -------------------------------------------------------------------------- */
/* Drop zone                                                                  */
/* -------------------------------------------------------------------------- */

export function UploadDropzone({
  folder,
  onUploaded,
  compact = false,
}: {
  folder: MediaFolderName;
  onUploaded: (assets: MediaAsset[]) => void;
  compact?: boolean;
}) {
  const { uploadFiles, uploading, progress } = useBlobUpload(folder);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
    if (list.length === 0) return;
    const assets = await uploadFiles(list);
    if (assets.length > 0) onUploaded(assets);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed text-center transition ${
        dragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/70'
      } ${compact ? 'px-4 py-5' : 'px-6 py-9'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2 text-sm text-slate-600">
          <Spinner className="h-6 w-6 text-primary" />
          <p>
            Uploading{progress ? ` ${progress.done + 1} of ${progress.total}` : ''}…
          </p>
        </div>
      ) : (
        <>
          <CloudArrowUp
            size={compact ? 24 : 30}
            className="mx-auto text-primary/50"
            aria-hidden="true"
          />
          <p className={`${compact ? 'mt-1.5 text-xs' : 'mt-2.5 text-sm'} text-slate-600`}>
            Drag images here, or{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              browse your device
            </button>
          </p>
          {!compact ? (
            <p className="mt-1 text-xs text-slate-400">
              JPEG, PNG, WebP, AVIF, GIF or SVG · up to 25 MB each · stored in Vercel Blob
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Picker modal                                                               */
/* -------------------------------------------------------------------------- */

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  folder = 'blog',
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  folder?: MediaFolderName;
  multiple?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Record<string, MediaAsset>>({});
  const debouncedSearch = useDebounced(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ pageSize: '60', folder: folderFilter });
      if (debouncedSearch) params.set('q', debouncedSearch);

      const response = await fetch(`/api/admin/media?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) setError(result.error ?? 'Unable to load the media library.');
      else setAssets(result.data ?? []);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, folderFilter]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) setSelected({});
  }, [open]);

  const toggle = (asset: MediaAsset) => {
    if (!multiple) {
      onSelect([asset]);
      onClose();
      return;
    }
    setSelected((current) => {
      const next = { ...current };
      if (next[asset.id]) delete next[asset.id];
      else next[asset.id] = asset;
      return next;
    });
  };

  const selectedList = Object.values(selected);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose an image"
      description="Pick from your Vercel Blob library, or upload something new."
      size="lg"
      footer={
        multiple ? (
          <>
            <span className="mr-auto text-xs text-slate-500">
              {selectedList.length} selected
            </span>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={selectedList.length === 0}
              onClick={() => {
                onSelect(selectedList);
                onClose();
              }}
            >
              Use {selectedList.length || ''} image{selectedList.length === 1 ? '' : 's'}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <UploadDropzone
          folder={folder}
          compact
          onUploaded={(uploaded) => {
            setAssets((current) => [...uploaded, ...current]);
            if (!multiple && uploaded[0]) {
              onSelect([uploaded[0]]);
              onClose();
            }
          }}
        />

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-48 flex-1">
            <MagnifyingGlass
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by file name…"
              className="pl-9"
            />
          </div>
          <Select
            value={folderFilter}
            onChange={(event) => setFolderFilter(event.target.value)}
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

        {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-[4/3] animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            icon={<ImageSquare size={22} />}
            title="Nothing in the library yet"
            description="Upload an image above and it will appear here."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {assets.map((asset) => {
              const isSelected = Boolean(selected[asset.id]);
              return (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => toggle(asset)}
                    aria-pressed={multiple ? isSelected : undefined}
                    className={`group relative block w-full overflow-hidden rounded-xl border-2 bg-slate-100 text-left transition ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-primary/40'
                    }`}
                  >
                    {/* Blob URLs are remote and arbitrary, so a plain img avoids
                        having to allow-list every store hostname for next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.alt || asset.filename}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {isSelected ? (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-0.5">
                        <CheckCircle size={18} weight="fill" className="text-primary" />
                      </span>
                    ) : null}
                    <span className="block truncate px-2 py-1.5 text-[11px] text-slate-600">
                      {asset.filename}
                      <span className="text-slate-400"> · {formatBytes(asset.size_bytes)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
