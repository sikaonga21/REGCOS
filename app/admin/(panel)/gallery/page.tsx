'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DotsSixVertical,
  Eye,
  EyeSlash,
  ImageSquare,
  PencilSimple,
  Plus,
  Star,
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
  Select,
  SkeletonRows,
  Switch,
  useToast,
} from '@/components/admin/ui';
import { MediaPickerModal } from '@/components/admin/MediaPicker';
import { galleryCategories } from '@/lib/gallery';
import type { GalleryPhotoRow } from '@/lib/db/types';

type Draft = {
  src: string;
  alt: string;
  caption: string;
  category: string;
  width: number;
  height: number;
  published: boolean;
  highlight: boolean;
};

const emptyDraft = (): Draft => ({
  src: '',
  alt: '',
  caption: '',
  category: galleryCategories[0],
  width: 1920,
  height: 1280,
  published: true,
  highlight: false,
});

export default function GalleryAdminPage() {
  const toast = useToast();

  const [photos, setPhotos] = useState<GalleryPhotoRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<GalleryPhotoRow | 'new' | null>(null);
  const [deleting, setDeleting] = useState<GalleryPhotoRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);

    try {
      const response = await fetch(`/api/admin/gallery?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load the gallery.');
      } else {
        setPhotos(result.data ?? []);
        setCounts(result.counts ?? {});
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (draft: Draft, id?: string) => {
    if (!draft.src) {
      toast.push('Choose an image first.', 'error');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(id ? `/api/admin/gallery/${id}` : '/api/admin/gallery', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not save the photo.', 'error');
      } else {
        toast.push(id ? 'Photo updated.' : 'Photo added to the gallery.');
        setEditing(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (photo: GalleryPhotoRow) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/gallery/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...photo, published: !photo.published }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        toast.push(result.error ?? 'Could not update the photo.', 'error');
      } else {
        toast.push(photo.published ? 'Hidden from the public gallery.' : 'Now live on the gallery.');
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
      const response = await fetch(`/api/admin/gallery/${deleting.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not remove the photo.', 'error');
      } else {
        toast.push('Photo removed from the gallery. The file is still in your media library.');
        setDeleting(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  /**
   * Reorder is optimistic: the grid reflows immediately and the new order is
   * persisted in the background. A failure reloads the saved order.
   */
  const commitOrder = async (ordered: GalleryPhotoRow[]) => {
    setPhotos(ordered);
    try {
      const response = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ordered.map((photo) => photo.id) }),
      });

      if (!response.ok) {
        toast.push('Could not save the new order.', 'error');
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
      await load();
    }
  };

  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void commitOrder(next);
  };

  const reorderDisabled = category !== 'all';

  return (
    <div>
      <PageHeader
        eyebrow="Public site"
        title="Gallery"
        description="The photos on the public gallery page, in the order they appear."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus size={16} />
            Add photo
          </Button>
        }
      />

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
          <p className="font-heading text-sm font-semibold text-primary-dark">
            {photos.length} photo{photos.length === 1 ? '' : 's'}
          </p>
          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="ml-auto w-auto"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {galleryCategories.map((name) => (
              <option key={name} value={name}>
                {name}
                {counts[name] ? ` (${counts[name]})` : ''}
              </option>
            ))}
          </Select>
        </div>

        <div className="p-4 sm:p-5">
          {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

          {reorderDisabled && photos.length > 1 ? (
            <p className="mb-4 rounded-xl bg-bg-light px-3.5 py-2.5 text-xs text-slate-600">
              Showing one category. Switch to <strong>All categories</strong> to change the display
              order.
            </p>
          ) : null}

          {loading ? (
            <SkeletonRows rows={4} />
          ) : photos.length === 0 ? (
            <EmptyState
              icon={<ImageSquare size={22} />}
              title={category === 'all' ? 'No gallery photos yet' : 'Nothing in this category'}
              description={
                category === 'all'
                  ? 'Run "npm run db:setup" to import the photos already bundled with the site, or add one now.'
                  : 'Add a photo and assign it to this category.'
              }
              action={
                <Button onClick={() => setEditing('new')}>
                  <Plus size={16} />
                  Add photo
                </Button>
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, index) => (
                <li
                  key={photo.id}
                  draggable={!reorderDisabled}
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(event) => {
                    if (reorderDisabled || dragIndex === null) return;
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    if (reorderDisabled || dragIndex === null) return;
                    event.preventDefault();
                    moveTo(dragIndex, index);
                    setDragIndex(null);
                  }}
                  className={`overflow-hidden rounded-xl border bg-white transition ${
                    dragIndex === index
                      ? 'border-primary opacity-50'
                      : 'border-slate-200 hover:border-primary/30'
                  } ${!photo.published ? 'bg-slate-50' : ''}`}
                >
                  <div className="relative bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt || photo.caption}
                      loading="lazy"
                      className={`aspect-[4/3] w-full object-cover ${
                        photo.published ? '' : 'opacity-50 grayscale'
                      }`}
                    />
                    <div className="absolute left-1.5 top-1.5 flex gap-1.5">
                      {!photo.published ? <Badge tone="slate">Hidden</Badge> : null}
                      {photo.highlight ? <Badge tone="yellow">Home page</Badge> : null}
                    </div>
                    {!reorderDisabled ? (
                      <span
                        className="absolute right-1.5 top-1.5 cursor-grab rounded-lg bg-white/90 p-1 text-slate-400"
                        title="Drag to reorder"
                        aria-hidden="true"
                      >
                        <DotsSixVertical size={15} />
                      </span>
                    ) : null}
                  </div>

                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {photo.caption || <span className="text-slate-400">No caption</span>}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{photo.category}</p>
                    {!photo.alt ? (
                      <p className="mt-1 text-[11px] font-medium text-[#7a5c00]">
                        No image description
                      </p>
                    ) : null}

                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      {!reorderDisabled ? (
                        <span className="flex items-center gap-0.5">
                          <IconButton
                            label="Move earlier"
                            disabled={index === 0}
                            onClick={() => moveTo(index, index - 1)}
                          >
                            <span aria-hidden="true" className="text-xs font-bold">
                              ←
                            </span>
                          </IconButton>
                          <IconButton
                            label="Move later"
                            disabled={index === photos.length - 1}
                            onClick={() => moveTo(index, index + 1)}
                          >
                            <span aria-hidden="true" className="text-xs font-bold">
                              →
                            </span>
                          </IconButton>
                        </span>
                      ) : (
                        <span />
                      )}

                      <span className="flex items-center gap-0.5">
                        <IconButton
                          label={photo.published ? 'Hide from gallery' : 'Show on gallery'}
                          disabled={busy}
                          onClick={() => void togglePublished(photo)}
                        >
                          {photo.published ? <Eye size={15} /> : <EyeSlash size={15} />}
                        </IconButton>
                        <IconButton label="Edit photo" onClick={() => setEditing(photo)}>
                          <PencilSimple size={15} />
                        </IconButton>
                        <IconButton
                          label="Remove from gallery"
                          onClick={() => setDeleting(photo)}
                          className="text-accent hover:bg-accent/10"
                        >
                          <Trash size={15} />
                        </IconButton>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {editing ? (
        <PhotoEditor
          photo={editing === 'new' ? null : editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSave={(draft) => void save(draft, editing === 'new' ? undefined : editing.id)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this photo from the gallery?"
        message="It will no longer appear on the public gallery page. The image file stays in your media library and can be added again."
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function PhotoEditor({
  photo,
  busy,
  onClose,
  onSave,
}: {
  photo: GalleryPhotoRow | null;
  busy: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() =>
    photo
      ? {
          src: photo.src,
          alt: photo.alt ?? '',
          caption: photo.caption ?? '',
          category: photo.category || galleryCategories[0],
          width: photo.width || 1920,
          height: photo.height || 1280,
          published: photo.published,
          highlight: photo.highlight,
        }
      : emptyDraft()
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  /**
   * Reads the real pixel dimensions off the chosen image so the public gallery
   * can reserve the right space and avoid layout shift.
   */
  const measure = (url: string) => {
    const probe = new window.Image();
    probe.onload = () => {
      if (probe.naturalWidth && probe.naturalHeight) {
        setDraft((current) => ({
          ...current,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        }));
      }
    };
    probe.src = url;
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={photo ? 'Edit photo' : 'Add a gallery photo'}
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={() => onSave(draft)} loading={busy}>
              {photo ? 'Save changes' : 'Add to gallery'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Image</span>
            {draft.src ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.src}
                  alt={draft.alt}
                  className="max-h-60 w-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-9 text-center">
                <ImageSquare size={28} className="mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-sm text-slate-500">No image chosen yet.</p>
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-2.5" onClick={() => setPickerOpen(true)}>
              {draft.src ? 'Change image' : 'Choose image'}
            </Button>
          </div>

          <Field label="Caption" hint="Shown under the photo in the gallery lightbox.">
            <Input
              value={draft.caption}
              onChange={(event) => update('caption', event.target.value)}
              placeholder="Recorder practice in the music room"
            />
          </Field>

          <Field
            label="Image description"
            hint="Describes the photo for screen readers. Different from the caption."
          >
            <Input
              value={draft.alt}
              onChange={(event) => update('alt', event.target.value)}
              placeholder="Children playing recorders together in the school music room"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category" className="sm:col-span-1">
              <Select
                value={draft.category}
                onChange={(event) => update('category', event.target.value)}
              >
                {galleryCategories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Width (px)">
              <Input
                type="number"
                min={1}
                value={draft.width}
                onChange={(event) => update('width', Number(event.target.value) || 1920)}
              />
            </Field>

            <Field label="Height (px)">
              <Input
                type="number"
                min={1}
                value={draft.height}
                onChange={(event) => update('height', Number(event.target.value) || 1280)}
              />
            </Field>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium text-slate-700">
                  Show on the public gallery
                </span>
                <span className="block text-xs text-slate-500">
                  Turn off to keep the photo without publishing it.
                </span>
              </span>
              <Switch
                checked={draft.published}
                onChange={(next) => update('published', next)}
                label="Show on the public gallery"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Star size={14} className="text-secondary-hover" />
                  Feature in the home page collage
                </span>
                <span className="block text-xs text-slate-500">
                  The home page shows the first five featured photos.
                </span>
              </span>
              <Switch
                checked={draft.highlight}
                onChange={(next) => update('highlight', next)}
                label="Feature in the home page collage"
              />
            </div>
          </div>
        </div>
      </Modal>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="gallery"
        onSelect={(assets) => {
          const asset = assets[0];
          if (!asset) return;
          update('src', asset.url);
          if (!draft.alt && asset.alt) update('alt', asset.alt);
          measure(asset.url);
        }}
      />
    </>
  );
}
