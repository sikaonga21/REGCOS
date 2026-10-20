'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DownloadSimple,
  Envelope,
  MagnifyingGlass,
  Phone,
  Trash,
  UsersThree,
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
  PageHeader,
  Pagination,
  SkeletonRows,
  StatusBadge,
  useDebounced,
  useToast,
} from '@/components/admin/ui';
import { formatDate, relativeTime } from '@/lib/dates';
import type { Enrollment, EnrollmentStatus } from '@/lib/db/types';
import EnrollmentDetail from './EnrollmentDetail';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'declined', label: 'Declined' },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]['value'];

export default function EnrollmentsPage() {
  const toast = useToast();

  const [rows, setRows] = useState<Enrollment[]>([]);
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
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status !== 'all') params.set('status', status);
    if (debouncedSearch) params.set('q', debouncedSearch);

    try {
      const response = await fetch(`/api/admin/enrollments?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load applications.');
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

  const updateStatus = async (row: Enrollment, next: EnrollmentStatus) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/enrollments/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not update the application.', 'error');
      } else {
        toast.push(`${row.child_name} moved to ${next}.`);
        setSelected((current) => (current && current.id === row.id ? result.data : current));
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
      const response = await fetch(`/api/admin/enrollments/${deleting.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not delete the application.', 'error');
      } else {
        toast.push('Application deleted.');
        setDeleting(null);
        setSelected(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const exportUrl = `/api/admin/enrollments/export${status !== 'all' ? `?status=${status}` : ''}`;

  return (
    <div>
      <PageHeader
        eyebrow="Admissions"
        title="Enrollments"
        description="Applications submitted through the enrollment form on the website."
        actions={
          <a href={exportUrl} download>
            <Button variant="outline">
              <DownloadSimple size={16} />
              Export CSV
            </Button>
          </a>
        }
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
              placeholder="Search by child, guardian, email…"
              className="pl-9"
              aria-label="Search applications"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

          {loading ? (
            <SkeletonRows rows={6} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<UsersThree size={22} />}
              title={search || status !== 'all' ? 'No applications match' : 'No applications yet'}
              description={
                search || status !== 'all'
                  ? 'Try a different search or clear the filter.'
                  : 'When a parent submits the enrollment form, it will appear here.'
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th scope="col" className="py-2.5 pr-4 font-semibold">Child</th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">Guardian</th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">Start date</th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">Status</th>
                      <th scope="col" className="py-2.5 pr-4 font-semibold">Received</th>
                      <th scope="col" className="py-2.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="py-3 pr-4">
                          <button
                            type="button"
                            onClick={() => setSelected(row)}
                            className="text-left font-medium text-slate-800 hover:text-primary hover:underline"
                          >
                            {row.child_name}
                          </button>
                          <span className="block text-xs text-slate-400">
                            {row.child_dob ? `Born ${row.child_dob}` : '—'}
                            {row.gender ? ` · ${row.gender}` : ''}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="block text-slate-700">{row.guardian_name || '—'}</span>
                          <span className="flex items-center gap-2 text-xs text-slate-400">
                            {row.email ? (
                              <a
                                href={`mailto:${row.email}`}
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <Envelope size={11} />
                                {row.email}
                              </a>
                            ) : null}
                            {row.phone ? (
                              <a
                                href={`tel:${row.phone}`}
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <Phone size={11} />
                                {row.phone}
                              </a>
                            ) : null}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-500">{row.start_date || '—'}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-500" title={formatDate(row.created_at)}>
                          {relativeTime(row.created_at)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                              Review
                            </Button>
                            <IconButton
                              label="Delete application"
                              onClick={() => setDeleting(row)}
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

      {selected ? (
        <EnrollmentDetail
          enrollment={selected}
          busy={busy}
          onClose={() => setSelected(null)}
          onStatusChange={(next) => void updateStatus(selected, next)}
          onDelete={() => setDeleting(selected)}
          onSaved={() => void load()}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this application?"
        message={`The application for ${deleting?.child_name ?? 'this child'} will be permanently removed, including every answer on the form. Export first if you need a record.`}
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
