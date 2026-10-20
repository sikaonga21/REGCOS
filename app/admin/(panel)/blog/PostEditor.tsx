'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImageSquare, Plus, Star, Trash, X } from 'phosphor-react';
import {
  Badge,
  Button,
  Checkbox,
  Field,
  IconButton,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from '@/components/admin/ui';
import { MediaPickerModal } from '@/components/admin/MediaPicker';
import { estimateReadMinutes, slugify } from '@/lib/slug';
import { POST_CATEGORIES, type BlogPost } from '@/lib/db/types';

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_minutes: number;
  featured_images: string[];
  featured_image_alt: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
};

const EMPTY: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: POST_CATEGORIES[0],
  author: 'The Regcos Team',
  read_minutes: 0,
  featured_images: [],
  featured_image_alt: '',
  tags: [],
  seo_title: '',
  seo_description: '',
  status: 'draft',
  is_featured: false,
};

function fromPost(post: BlogPost): FormState {
  const images = Array.isArray(post.featured_images) ? post.featured_images.filter(Boolean) : [];
  return {
    title: post.title ?? '',
    slug: post.slug ?? '',
    excerpt: post.excerpt ?? '',
    content: post.content ?? '',
    category: post.category || POST_CATEGORIES[0],
    author: post.author || 'The Regcos Team',
    read_minutes: post.read_minutes ?? 0,
    featured_images: images.length > 0 ? images : post.featured_image ? [post.featured_image] : [],
    featured_image_alt: post.featured_image_alt ?? '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    seo_title: post.seo_title ?? '',
    seo_description: post.seo_description ?? '',
    status: post.status ?? 'draft',
    is_featured: Boolean(post.is_featured),
  };
}

export default function PostEditor({
  post,
  onClose,
  onSaved,
}: {
  post: BlogPost | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(post ? fromPost(post) : EMPTY);
  const [tab, setTab] = useState<'write' | 'media' | 'seo'>('write');
  const [tagDraft, setTagDraft] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<Partial<Record<keyof FormState, string>>>({});

  // Keep the slug in step with the title until the post has been saved once;
  // after that the slug is a published URL and must not move on its own.
  const [slugLocked, setSlugLocked] = useState(Boolean(post));

  useEffect(() => {
    if (slugLocked) return;
    setForm((current) => ({ ...current, slug: slugify(current.title) }));
  }, [form.title, slugLocked]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldError((current) => ({ ...current, [key]: undefined }));
  };

  const readMinutes = form.read_minutes || estimateReadMinutes(form.content);
  const wordCount = useMemo(
    () => form.content.trim().split(/\s+/).filter(Boolean).length,
    [form.content]
  );

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag) return;
    if (!form.tags.includes(tag)) update('tags', [...form.tags, tag]);
    setTagDraft('');
  };

  const handleSave = async (status?: FormState['status']) => {
    const nextStatus = status ?? form.status;

    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errors.title = 'A title is required.';
    if (!form.content.trim()) errors.content = 'Write something before saving.';
    if (!form.slug.trim()) errors.slug = 'A URL slug is required.';

    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      setTab('write');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(post ? `/api/admin/posts/${post.id}` : '/api/admin/posts', {
        method: post ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: nextStatus,
          read_minutes: readMinutes,
          featured_image: form.featured_images[0] ?? '',
          featured_image_alt: form.featured_image_alt || form.title,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not save the post.', 'error');
        setSaving(false);
        return;
      }

      toast.push(
        post
          ? 'Post updated.'
          : nextStatus === 'published'
            ? 'Post published.'
            : 'Draft saved.'
      );
      onSaved();
    } catch {
      toast.push('Could not reach the server.', 'error');
      setSaving(false);
    }
  };

  const tabs = [
    { value: 'write', label: 'Write' },
    { value: 'media', label: `Images${form.featured_images.length ? ` (${form.featured_images.length})` : ''}` },
    { value: 'seo', label: 'SEO' },
  ] as const;

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={post ? 'Edit post' : 'New post'}
        description={post ? `Last updated ${new Date(post.updated_at).toLocaleString('en-GB')}` : undefined}
        size="xl"
        footer={
          <>
            <span className="mr-auto text-xs text-slate-500">
              {wordCount} words · about {readMinutes} min read
            </span>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => void handleSave('draft')} loading={saving}>
              Save draft
            </Button>
            <Button onClick={() => void handleSave('published')} loading={saving}>
              {form.status === 'published' ? 'Update & publish' : 'Publish'}
            </Button>
          </>
        }
      >
        <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              aria-pressed={tab === item.value}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === item.value ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'write' ? (
          <div className="space-y-4">
            <Field label="Title" required error={fieldError.title}>
              <Input
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="Sports Day 2026: a day of joy and teamwork"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="URL slug"
                required
                error={fieldError.slug}
                hint={slugLocked ? 'Changing this changes the public link.' : 'Generated from the title.'}
              >
                <Input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugLocked(true);
                    update('slug', slugify(event.target.value));
                  }}
                  placeholder="sports-day-2026"
                />
              </Field>

              <Field label="Category">
                <Select value={form.category} onChange={(event) => update('category', event.target.value)}>
                  {POST_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Author">
                <Input value={form.author} onChange={(event) => update('author', event.target.value)} />
              </Field>

              <Field label="Read time" hint="Leave at 0 to calculate from the word count.">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={form.read_minutes}
                  onChange={(event) => update('read_minutes', Number(event.target.value) || 0)}
                />
              </Field>
            </div>

            <Field
              label="Excerpt"
              hint={`Shown on the blog index and in link previews · ${form.excerpt.length}/300`}
            >
              <Textarea
                rows={3}
                maxLength={300}
                value={form.excerpt}
                onChange={(event) => update('excerpt', event.target.value)}
                placeholder="A short summary that makes a parent want to read on."
              />
            </Field>

            <Field label="Content" required error={fieldError.content}>
              <Textarea
                rows={14}
                value={form.content}
                onChange={(event) => update('content', event.target.value)}
                placeholder="Write the post. Leave a blank line between paragraphs."
                className="font-sans leading-relaxed"
              />
            </Field>

            <Field label="Tags" hint="Press Enter to add a tag.">
              <div className="flex gap-2">
                <Input
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="sports, community"
                />
                <Button variant="outline" onClick={addTag}>
                  <Plus size={15} />
                  Add
                </Button>
              </div>
            </Field>

            {form.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <li key={tag}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 py-1 pl-2.5 pr-1 text-xs font-medium text-primary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => update('tags', form.tags.filter((item) => item !== tag))}
                        aria-label={`Remove tag ${tag}`}
                        className="rounded-full p-0.5 transition hover:bg-primary/15"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 pt-4">
              <Field label="Status" className="w-40">
                <Select
                  value={form.status}
                  onChange={(event) => update('status', event.target.value as FormState['status'])}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <Checkbox
                label="Feature this post"
                description="Featured posts appear first on the blog page."
                checked={form.is_featured}
                onChange={(event) => update('is_featured', event.target.checked)}
                className="mt-6"
              />
            </div>
          </div>
        ) : null}

        {tab === 'media' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                The first image is the post&rsquo;s cover. Drag is not needed — use the star to
                promote an image.
              </p>
              <Button variant="outline" onClick={() => setPickerOpen(true)}>
                <ImageSquare size={15} />
                Add images
              </Button>
            </div>

            {form.featured_images.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
                <ImageSquare size={28} className="mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-2.5 text-sm text-slate-500">No images attached yet.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setPickerOpen(true)}>
                  Choose from media library
                </Button>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.featured_images.map((url, index) => (
                  <li
                    key={url}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {index === 0 ? (
                      <span className="absolute left-1.5 top-1.5">
                        <Badge tone="blue">Cover</Badge>
                      </span>
                    ) : null}
                    <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                      {index !== 0 ? (
                        <IconButton
                          label="Use as cover image"
                          className="bg-white/95 text-primary shadow hover:bg-white"
                          onClick={() =>
                            update('featured_images', [
                              url,
                              ...form.featured_images.filter((item) => item !== url),
                            ])
                          }
                        >
                          <Star size={14} />
                        </IconButton>
                      ) : null}
                      <IconButton
                        label="Remove image"
                        className="bg-white/95 text-accent shadow hover:bg-white"
                        onClick={() =>
                          update('featured_images', form.featured_images.filter((item) => item !== url))
                        }
                      >
                        <Trash size={14} />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Field
              label="Cover image description"
              hint="Describe the picture for screen readers and for when an image fails to load."
            >
              <Input
                value={form.featured_image_alt}
                onChange={(event) => update('featured_image_alt', event.target.value)}
                placeholder="Pupils racing on the school field during Sports Day"
              />
            </Field>
          </div>
        ) : null}

        {tab === 'seo' ? (
          <div className="space-y-4">
            <Field
              label="Search engine title"
              hint={`Falls back to the post title · ${form.seo_title.length}/60 recommended`}
            >
              <Input
                value={form.seo_title}
                onChange={(event) => update('seo_title', event.target.value)}
                placeholder={form.title || 'Sports Day 2026'}
              />
            </Field>

            <Field
              label="Search engine description"
              hint={`Falls back to the excerpt · ${form.seo_description.length}/160 recommended`}
            >
              <Textarea
                rows={3}
                value={form.seo_description}
                onChange={(event) => update('seo_description', event.target.value)}
                placeholder={form.excerpt || 'A short summary for search results.'}
              />
            </Field>

            <div className="rounded-xl border border-slate-200 bg-bg-light p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search result preview
              </p>
              <p className="truncate text-sm text-[#1a0dab]">
                {form.seo_title || form.title || 'Post title'}
              </p>
              <p className="truncate text-xs text-emerald-700">
                regcoschristianacademy.com/blog/{form.slug || 'post-slug'}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                {form.seo_description || form.excerpt || 'Your description will appear here.'}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="blog"
        multiple
        onSelect={(assets) => {
          const urls = assets.map((asset) => asset.url);
          const merged = [...form.featured_images];
          for (const url of urls) if (!merged.includes(url)) merged.push(url);
          update('featured_images', merged);

          // Borrow the first asset's alt text if the post has none yet.
          if (!form.featured_image_alt && assets[0]?.alt) {
            update('featured_image_alt', assets[0].alt);
          }
        }}
      />
    </>
  );
}
