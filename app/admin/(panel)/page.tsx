'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Article,
  CalendarBlank,
  Envelope,
  HardDrives,
  ImageSquare,
  Plus,
  SquaresFour,
  UsersThree,
} from 'phosphor-react';
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorNotice,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  formatBytes,
} from '@/components/admin/ui';
import { PipelineChart, Sparkline, TrendChart } from '@/components/admin/charts';
import { compactNumber } from '@/lib/chart-palette';
import { relativeTime } from '@/lib/dates';
import type { DashboardStats } from '@/lib/db/stats';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blobConnected, setBlobConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/stats');
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load the dashboard.');
      } else {
        setStats(result.data);
        setBlobConnected(Boolean(result.blobConnected));
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Everything happening across the Regcos Christian Academy website."
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
            <Link href="/admin/blog">
              <Button size="md">
                <Plus size={16} />
                New post
              </Button>
            </Link>
          </>
        }
      />

      {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

      {loading && !stats ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <Card>
            <SkeletonRows rows={5} />
          </Card>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* The one hero figure on this view: applications awaiting a decision. */}
          <Card className="bg-gradient-to-br from-primary-dark via-primary to-[#02255a] text-white">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                  Needs your attention
                </p>
                <p className="mt-3 font-heading text-5xl font-bold leading-none">
                  {stats.enrollments.new}
                </p>
                <p className="mt-2 text-sm text-white/70">
                  {stats.enrollments.new === 1 ? 'new application' : 'new applications'} to review
                  {stats.messages.unread > 0
                    ? ` · ${stats.messages.unread} unread ${
                        stats.messages.unread === 1 ? 'message' : 'messages'
                      }`
                    : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/enrollments">
                  <Button variant="secondary" size="md">
                    Review applications
                  </Button>
                </Link>
                <Link href="/admin/messages">
                  <Button
                    size="md"
                    className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
                  >
                    Open inbox
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              icon={<UsersThree size={18} />}
              label="Applications"
              value={stats.enrollments.total}
              meta={`${stats.enrollments.last30} in the last 30 days`}
              trend={stats.trend.map((point) => point.enrollments)}
              href="/admin/enrollments"
            />
            <StatTile
              icon={<Envelope size={18} />}
              label="Messages"
              value={stats.messages.total}
              meta={`${stats.messages.unread} unread`}
              trend={stats.trend.map((point) => point.messages)}
              href="/admin/messages"
            />
            <StatTile
              icon={<Article size={18} />}
              label="Blog posts"
              value={stats.posts.total}
              meta={`${stats.posts.published} published · ${stats.posts.draft} draft`}
              trend={stats.trend.map((point) => point.posts)}
              href="/admin/blog"
            />
            <StatTile
              icon={<CalendarBlank size={18} />}
              label="Events"
              value={stats.events.total}
              meta={`${stats.events.upcoming} upcoming`}
              href="/admin/calendar"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader
                title="Last six months"
                description="Applications, enquiries, and posts created each month."
              />
              <TrendChart data={stats.trend} />
            </Card>

            <Card>
              <CardHeader title="Admissions pipeline" description="Where each application sits." />
              <PipelineChart counts={stats.enrollmentsByStatus} />
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader
                title="Latest applications"
                actions={
                  <Link
                    href="/admin/enrollments"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View all
                  </Link>
                }
              />
              {stats.recentEnrollments.length === 0 ? (
                <EmptyState
                  icon={<UsersThree size={22} />}
                  title="No applications yet"
                  description="Submissions from the enrollment form will appear here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.recentEnrollments.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {item.child_name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {relativeTime(item.created_at)}
                        </span>
                      </span>
                      <StatusBadge status={item.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Recent activity"
                description="Every change made in the admin panel."
                actions={
                  <Link
                    href="/admin/settings?tab=activity"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Full log
                  </Link>
                }
              />
              {stats.recentActivity.length === 0 ? (
                <EmptyState
                  icon={<SquaresFour size={22} />}
                  title="Nothing logged yet"
                  description="Your edits will be recorded here as you work."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.recentActivity.slice(0, 8).map((entry) => (
                    <li key={entry.id} className="py-2.5">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-slate-800">{entry.actor_email}</span>{' '}
                        {entry.action}
                        {entry.detail ? (
                          <span className="text-slate-500"> — {entry.detail}</span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {relativeTime(entry.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Storage"
              description="Images and files held in your Vercel Blob store."
              actions={
                <Link href="/admin/media">
                  <Button variant="outline" size="sm">
                    Open media library
                  </Button>
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStat
                icon={<ImageSquare size={16} />}
                label="Files"
                value={compactNumber(stats.media.total)}
              />
              <MiniStat
                icon={<HardDrives size={16} />}
                label="Used"
                value={formatBytes(stats.media.bytes)}
              />
              <MiniStat
                icon={<SquaresFour size={16} />}
                label="Gallery photos"
                value={`${stats.gallery.published} / ${stats.gallery.total} live`}
              />
            </div>
            {!blobConnected ? (
              <p className="mt-4 rounded-xl border border-secondary/60 bg-secondary/15 px-3.5 py-2.5 text-xs text-slate-700">
                Vercel Blob is not connected yet, so uploads are unavailable. Create a Blob store in
                your Vercel project and set <code>BLOB_READ_WRITE_TOKEN</code>.
              </p>
            ) : null}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  meta,
  trend,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  meta: string;
  trend?: number[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(6,59,130,0.04)] transition hover:border-primary/35 hover:shadow-[0_8px_24px_-14px_rgba(6,59,130,0.3)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
          {icon}
        </span>
        {trend ? <Sparkline values={trend} label={label} /> : null}
      </div>
      <p className="mt-3.5 text-sm text-slate-500">{label}</p>
      {/* Proportional figures: this is a display-size standalone number, not a column. */}
      <p className="mt-1 font-heading text-3xl font-bold leading-none text-primary-dark">
        {compactNumber(value)}
      </p>
      <p className="mt-1.5 text-xs text-slate-500">{meta}</p>
    </Link>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-light px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-slate-500">{label}</span>
        <span className="block truncate text-sm font-semibold text-slate-800">{value}</span>
      </span>
    </div>
  );
}
