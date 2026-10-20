'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  Envelope,
  EnvelopeOpen,
  MagnifyingGlass,
  Phone,
  Trash,
} from 'phosphor-react';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorNotice,
  FilterTabs,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SkeletonRows,
  StatusBadge,
  useDebounced,
  useToast,
} from '@/components/admin/ui';
import { formatDateTime, relativeTime } from '@/lib/dates';
import type { ContactMessage, MessageStatus } from '@/lib/db/types';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['value'];

export default function MessagesPage() {
  const toast = useToast();

  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [status, setStatus] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status !== 'all') params.set('status', status);
    if (debouncedSearch) params.set('q', debouncedSearch);

    try {
      const response = await fetch(`/api/admin/messages?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load messages.');
      } else {
        setRows(result.data ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(result.totalPages ?? 1);
        setCounts(result.counts ?? {});
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const setMessageStatus = async (row: ContactMessage, next: MessageStatus, quiet = false) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not update the message.', 'error');
      } else {
        if (!quiet) toast.push(`Marked as ${next}.`);
        setOpen((current) => (current && current.id === row.id ? result.data : current));
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  /** Opening an unread message marks it read, the way an inbox behaves. */
  const openMessage = (row: ContactMessage) => {
    setOpen(row);
    if (row.status === 'unread') void setMessageStatus(row, 'read', true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${deleting.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not delete the message.', 'error');
      } else {
        toast.push('Message deleted.');
        setDeleting(null);
        setOpen(null);
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
        eyebrow="Inbox"
        title="Messages"
        description="Enquiries submitted through the contact form on the website."
      />

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
          <FilterTabs options={STATUS_TABS} value={status} onChange={setStatus} counts={counts} />

          <div className="relative ml-auto min-w-52 flex-1 sm:max-w-xs">
            <MagnifyingGlass
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages…"
              className="pl-9"
              aria-label="Search messages"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

          {loading ? (
            <SkeletonRows rows={6} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<Envelope size={22} />}
              title={search || status !== 'all' ? 'No messages match' : 'Inbox is empty'}
              description={
                search || status !== 'all'
                  ? 'Try a different search or clear the filter.'
                  : 'Enquiries from the contact form will land here.'
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className={`flex flex-wrap items-start gap-3 py-3 transition ${
                      row.status === 'unread' ? 'border-l-2 border-secondary pl-3 -ml-3.5' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openMessage(row)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`truncate ${
                            row.status === 'unread'
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-700'
                          }`}
                        >
                          {row.name || 'Unknown sender'}
                        </span>
                        <StatusBadge status={row.status} />
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-slate-600">
                        {row.subject || 'No subject'}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {row.message}
                      </span>
                    </button>

                    <span className="flex shrink-0 items-center gap-1.5">
                      <span
                        className="hidden text-xs text-slate-400 sm:block"
                        title={formatDateTime(row.created_at)}
                      >
                        {relativeTime(row.created_at)}
                      </span>
                      <IconButton
                        label={row.status === 'unread' ? 'Mark as read' : 'Mark as unread'}
                        disabled={busy}
                        onClick={() =>
                          void setMessageStatus(row, row.status === 'unread' ? 'read' : 'unread')
                        }
                      >
                        {row.status === 'unread' ? (
                          <EnvelopeOpen size={15} />
                        ) : (
                          <Envelope size={15} />
                        )}
                      </IconButton>
                      <IconButton
                        label="Archive message"
                        disabled={busy}
                        onClick={() => void setMessageStatus(row, 'archived')}
                      >
                        <Archive size={15} />
                      </IconButton>
                      <IconButton
                        label="Delete message"
                        onClick={() => setDeleting(row)}
                        className="text-accent hover:bg-accent/10"
                      >
                        <Trash size={15} />
                      </IconButton>
                    </span>
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

      {open ? (
        <Modal
          open
          onClose={() => setOpen(null)}
          title={open.subject || 'No subject'}
          description={`From ${open.name || 'unknown'} · ${formatDateTime(open.created_at)}`}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setDeleting(open)}
                className="mr-auto text-accent hover:bg-accent/10"
              >
                <Trash size={15} />
                Delete
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void setMessageStatus(open, 'archived')}
              >
                Archive
              </Button>
              {open.email ? (
                <a
                  href={`mailto:${open.email}?subject=${encodeURIComponent(
                    `Re: ${open.subject || 'Your enquiry'}`
                  )}`}
                  onClick={() => void setMessageStatus(open, 'replied', true)}
                >
                  <Button>
                    <Envelope size={15} />
                    Reply by email
                  </Button>
                </a>
              ) : null}
            </>
          }
        >
          <div className="space-y-4">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="text-sm">
                  {open.email ? (
                    <a href={`mailto:${open.email}`} className="text-primary hover:underline">
                      {open.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="text-sm">
                  {open.phone ? (
                    <a
                      href={`tel:${open.phone}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone size={12} />
                      {open.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl border border-slate-200 bg-bg-light p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {open.message}
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this message?"
        message={`The enquiry from ${deleting?.name || 'this sender'} will be permanently removed.`}
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
