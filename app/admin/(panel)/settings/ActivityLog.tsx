'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClockCounterClockwise, MagnifyingGlass } from 'phosphor-react';
import {
  Badge,
  Card,
  EmptyState,
  ErrorNotice,
  Input,
  Pagination,
  SkeletonRows,
  useDebounced,
} from '@/components/admin/ui';
import { formatDateTime, relativeTime } from '@/lib/dates';
import type { AuditEntry } from '@/lib/db/types';

export default function ActivityLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 40;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (debouncedSearch) params.set('q', debouncedSearch);

    try {
      const response = await fetch(`/api/admin/audit?${params}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load the activity log.');
      } else {
        setEntries(result.data ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(result.totalPages ?? 1);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:p-5">
        <div>
          <p className="font-heading text-sm font-semibold text-primary-dark">Activity log</p>
          <p className="text-xs text-slate-500">
            {total} recorded change{total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="relative ml-auto min-w-52 flex-1 sm:max-w-xs">
          <MagnifyingGlass
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by person or action…"
            className="pl-9"
            aria-label="Search the activity log"
          />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

        {loading ? (
          <SkeletonRows rows={8} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<ClockCounterClockwise size={22} />}
            title={search ? 'Nothing matches that search' : 'Nothing logged yet'}
            description={
              search
                ? 'Try a different name or action.'
                : 'Edits made in the admin panel are recorded here.'
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-start gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-700">
                      <span className="font-medium text-slate-800">{entry.actor_email}</span>{' '}
                      {entry.action}
                      {entry.detail ? (
                        <span className="text-slate-500"> — {entry.detail}</span>
                      ) : null}
                    </span>
                    <span
                      className="block text-xs text-slate-400"
                      title={formatDateTime(entry.created_at)}
                    >
                      {relativeTime(entry.created_at)}
                    </span>
                  </span>
                  {entry.entity ? <Badge tone="slate">{entry.entity}</Badge> : null}
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
  );
}
