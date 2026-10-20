'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Article,
  ArrowSquareOut,
  Eye,
  MagnifyingGlass,
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
  FilterTabs,
  IconButton,
  Input,
  PageHeader,
  Pagination,
  Select,
  SkeletonRows,
  StatusBadge,
  useDebounced,
  useToast,
} from '@/components/admin/ui';
import { formatDate } from '@/lib/dates';
import type { BlogPost } from '@/lib/db/types';
import PostEditor from './PostEditor';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'archived', label: 'Archived' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['value'];

const SORT_OPTIONS = [
  { value: 'updated_at:desc', label: 'Recently updated' },
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'published_at:desc', label: 'Recently published' },
  { value: 'title:asc', label: 'Title A–Z' },
] as const;

export default function BlogAdminPage() {
  const toast = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const [status, setStatus] = useState<StatusTab>('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<string>('updated_at:desc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<string[]>([]);
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const [sortColumn, sortDirection] = sort.split(':');
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort: sortColumn,
      dir: sortDirection,
    });
    if (status !== 'all') params.set('status', status);
    if (category !== 'all') params.set('category', category);
    if (debouncedSearch) params.set('q', debouncedSearch);

    try {
      const response = await fetch(`/api/admin/posts?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load posts.');
      } else {
        setPosts(result.data ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(result.totalPages ?? 1);
        setCategories(result.categories ?? []);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, status, category, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
    setSelection([]);
  }, [status, category, debouncedSearch, sort]);

  const allSelected = posts.length > 0 && selection.length === posts.length;

  const toggleAll = () => setSelection(allSelected ? [] : posts.map((post) => post.id));

  const toggleOne = (id: string) =>
    setSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const patchPost = async (post: BlogPost, body: Record<string, unknown>, message: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not update the post.', 'error');
      } else {
        toast.push(message);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const runBulk = async (action: string, label: string) => {
    if (selection.length === 0) return;
    setBusy(true);
    try {
      const response = await fetch('/api/admin/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selection }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not apply that action.', 'error');
      } else {
        toast.push(`${result.affected} post${result.affected === 1 ? '' : 's'} ${label}.`);
        setSelection([]);
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
      const response = await fetch(`/api/admin/posts/${deleting.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not delete the post.', 'error');
      } else {
        toast.push('Post deleted.');
        setDeleting(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const categoryOptions = useMemo(
    () => categories.filter((entry) => entry.category),
    [categories]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Write, publish, and organise the news and stories on the public blog."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus size={16} />
            New post
          </Button>
        }
      />

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
          <FilterTabs options={STATUS_TABS} value={status} onChange={setStatus} />

          <div className="relative ml-auto min-w-52 flex-1 sm:max-w-xs">
            <MagnifyingGlass
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts…"
              className="pl-9"
              aria-label="Search posts"
            />
          </div>

          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-auto"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categoryOptions.map((entry) => (
              <option key={entry.category} value={entry.category}>
                {entry.category} ({entry.count})
              </option>
            ))}
          </Select>

          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="w-auto"
            aria-label="Sort posts"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {selection.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-primary/15 bg-primary/5 px-4 py-2.5 sm:px-5">
            <span className="text-xs font-semibold text-primary">
              {selection.length} selected
            </span>
            <div className="ml-auto flex flex-wrap gap-1.5">
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void runBulk('publish', 'published')}>
                Publish
              </Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void runBulk('draft', 'moved to drafts')}>
                Unpublish
              </Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void runBulk('archive', 'archived')}>
                Archive
              </Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void runBulk('feature', 'featured')}>
                Feature
              </Button>
              <Button variant="danger" size="sm" disabled={busy} onClick={() => void runBulk('delete', 'deleted')}>
                Delete
              </Button>
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-5">
          {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

          {loading ? (
            <SkeletonRows rows={6} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<Article size={22} />}
              title={search || status !== 'all' ? 'No posts match those filters' : 'No posts yet'}
              description={
                search || status !== 'all'
                  ? 'Try a different search term or clear the filters.'
                  : 'Write your first story for the school blog.'
              }
              action={
                search || status !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                      setCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setEditing('new')}>
                    <Plus size={16} />
                    New post
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[46rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th scope="col" className="w-10 py-2.5 pr-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleAll}
                          aria-label="Select all posts on this page"
                          className="h-4 w-4 rounded border-slate-300 accent-primary"
                        />
                      </th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">
                        Post
                      </th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">
                        Category
                      </th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">
                        Updated
                      </th>
                      <th scope="col" className="py-2.5 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="py-3 pr-2">
                          <input
                            type="checkbox"
                            checked={selection.includes(post.id)}
                            onChange={() => toggleOne(post.id)}
                            aria-label={`Select ${post.title}`}
                            className="h-4 w-4 rounded border-slate-300 accent-primary"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {post.featured_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.featured_image}
                                alt=""
                                loading="lazy"
                                className="h-10 w-14 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                <Article size={16} />
                              </span>
                            )}
                            <span className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setEditing(post)}
                                className="block max-w-xs truncate text-left font-medium text-slate-800 hover:text-primary hover:underline"
                              >
                                {post.title}
                              </button>
                              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                /{post.slug}
                                {post.is_featured ? (
                                  <Star size={11} weight="fill" className="text-secondary-hover" />
                                ) : null}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge tone="blue">{post.category}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={post.status} />
                        </td>
                        <td className="py-3 pr-4 text-xs tabular-nums text-slate-500">
                          {formatDate(post.updated_at)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <IconButton
                              label={post.is_featured ? 'Remove from featured' : 'Mark as featured'}
                              disabled={busy}
                              onClick={() =>
                                void patchPost(
                                  post,
                                  { is_featured: !post.is_featured },
                                  post.is_featured ? 'Removed from featured.' : 'Marked as featured.'
                                )
                              }
                            >
                              <Star
                                size={15}
                                weight={post.is_featured ? 'fill' : 'regular'}
                                className={post.is_featured ? 'text-secondary-hover' : ''}
                              />
                            </IconButton>
                            <IconButton
                              label={post.status === 'published' ? 'Unpublish' : 'Publish'}
                              disabled={busy}
                              onClick={() =>
                                void patchPost(
                                  post,
                                  { status: post.status === 'published' ? 'draft' : 'published' },
                                  post.status === 'published' ? 'Moved to drafts.' : 'Published.'
                                )
                              }
                            >
                              <Eye size={15} />
                            </IconButton>
                            {post.status === 'published' ? (
                              <Link
                                href={`/blog#${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`View ${post.title} on the site`}
                                title="View on the site"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-primary"
                              >
                                <ArrowSquareOut size={15} />
                              </Link>
                            ) : null}
                            <IconButton label="Edit post" onClick={() => setEditing(post)}>
                              <PencilSimple size={15} />
                            </IconButton>
                            <IconButton
                              label="Delete post"
                              onClick={() => setDeleting(post)}
                              className="text-accent hover:bg-accent/10"
                            >
                              <Trash size={15} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

      {editing ? (
        <PostEditor
          post={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this post?"
        message={`“${deleting?.title ?? ''}” will be permanently removed from the database. This cannot be undone.`}
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
