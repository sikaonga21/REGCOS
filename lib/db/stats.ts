import { query } from '@/lib/db/client';

export type DashboardStats = {
  posts: { total: number; published: number; draft: number; archived: number };
  events: { total: number; upcoming: number; thisMonth: number };
  enrollments: { total: number; new: number; last30: number };
  messages: { total: number; unread: number; last30: number };
  media: { total: number; bytes: number };
  gallery: { total: number; published: number };
  trend: Array<{ month: string; enrollments: number; messages: number; posts: number }>;
  enrollmentsByStatus: Array<{ status: string; count: number }>;
  eventsByType: Array<{ type: string; count: number }>;
  recentEnrollments: Array<{ id: string; child_name: string; status: string; created_at: string }>;
  recentMessages: Array<{ id: string; name: string; subject: string; status: string; created_at: string }>;
  recentActivity: Array<{
    id: number;
    actor_email: string;
    action: string;
    entity: string;
    detail: string;
    created_at: string;
  }>;
};

/** Six month-buckets ending with the current month, so a quiet month still plots. */
function emptyTrend(): Array<{ month: string; enrollments: number; messages: number; posts: number }> {
  const months: Array<{ month: string; enrollments: number; messages: number; posts: number }> = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  cursor.setMonth(cursor.getMonth() - 5);

  for (let index = 0; index < 6; index += 1) {
    months.push({
      month: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
      enrollments: 0,
      messages: 0,
      posts: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

const monthlyCounts = (table: string, dateColumn = 'created_at') =>
  query<{ month: string; count: string }>(
    `select to_char(date_trunc('month', ${dateColumn}), 'YYYY-MM') as month, count(*)::text as count
       from ${table}
      where ${dateColumn} >= date_trunc('month', now()) - interval '5 months'
      group by 1`
  );

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    postCounts,
    eventCounts,
    enrollmentCounts,
    messageCounts,
    mediaCounts,
    galleryCounts,
    enrollmentsByStatus,
    eventsByType,
    enrollmentTrend,
    messageTrend,
    postTrend,
    recentEnrollments,
    recentMessages,
    recentActivity,
  ] = await Promise.all([
    query<{ status: string; count: string }>('select status, count(*)::text as count from blog_posts group by status'),
    query<{ total: string; upcoming: string; this_month: string }>(
      `select count(*)::text as total,
              count(*) filter (where start_at >= now())::text as upcoming,
              count(*) filter (where start_at >= date_trunc('month', now())
                                 and start_at < date_trunc('month', now()) + interval '1 month')::text as this_month
         from calendar_events`
    ),
    query<{ total: string; fresh: string; last30: string }>(
      `select count(*)::text as total,
              count(*) filter (where status = 'new')::text as fresh,
              count(*) filter (where created_at >= now() - interval '30 days')::text as last30
         from enrollments`
    ),
    query<{ total: string; unread: string; last30: string }>(
      `select count(*)::text as total,
              count(*) filter (where status = 'unread')::text as unread,
              count(*) filter (where created_at >= now() - interval '30 days')::text as last30
         from contact_messages`
    ),
    query<{ total: string; bytes: string }>(
      'select count(*)::text as total, coalesce(sum(size_bytes), 0)::text as bytes from media_assets'
    ),
    query<{ total: string; published: string }>(
      `select count(*)::text as total, count(*) filter (where published)::text as published from gallery_photos`
    ),
    query<{ status: string; count: string }>(
      'select status, count(*)::text as count from enrollments group by status'
    ),
    query<{ event_type: string; count: string }>(
      'select event_type, count(*)::text as count from calendar_events group by event_type'
    ),
    monthlyCounts('enrollments'),
    monthlyCounts('contact_messages'),
    monthlyCounts('blog_posts'),
    query<{ id: string; child_name: string; status: string; created_at: string }>(
      'select id, child_name, status, created_at from enrollments order by created_at desc limit 6'
    ),
    query<{ id: string; name: string; subject: string; status: string; created_at: string }>(
      'select id, name, subject, status, created_at from contact_messages order by created_at desc limit 6'
    ),
    query<DashboardStats['recentActivity'][number]>(
      'select id, actor_email, action, entity, detail, created_at from audit_log order by created_at desc limit 12'
    ),
  ]);

  const postsByStatus = Object.fromEntries(postCounts.map((row) => [row.status, Number(row.count)]));
  const trend = emptyTrend();
  const applyTrend = (
    rows: Array<{ month: string; count: string }>,
    field: 'enrollments' | 'messages' | 'posts'
  ) => {
    for (const row of rows) {
      const bucket = trend.find((entry) => entry.month === row.month);
      if (bucket) bucket[field] = Number(row.count);
    }
  };

  applyTrend(enrollmentTrend, 'enrollments');
  applyTrend(messageTrend, 'messages');
  applyTrend(postTrend, 'posts');

  return {
    posts: {
      total: Object.values(postsByStatus).reduce((sum, value) => sum + value, 0),
      published: postsByStatus.published ?? 0,
      draft: postsByStatus.draft ?? 0,
      archived: postsByStatus.archived ?? 0,
    },
    events: {
      total: Number(eventCounts[0]?.total ?? 0),
      upcoming: Number(eventCounts[0]?.upcoming ?? 0),
      thisMonth: Number(eventCounts[0]?.this_month ?? 0),
    },
    enrollments: {
      total: Number(enrollmentCounts[0]?.total ?? 0),
      new: Number(enrollmentCounts[0]?.fresh ?? 0),
      last30: Number(enrollmentCounts[0]?.last30 ?? 0),
    },
    messages: {
      total: Number(messageCounts[0]?.total ?? 0),
      unread: Number(messageCounts[0]?.unread ?? 0),
      last30: Number(messageCounts[0]?.last30 ?? 0),
    },
    media: {
      total: Number(mediaCounts[0]?.total ?? 0),
      bytes: Number(mediaCounts[0]?.bytes ?? 0),
    },
    gallery: {
      total: Number(galleryCounts[0]?.total ?? 0),
      published: Number(galleryCounts[0]?.published ?? 0),
    },
    trend,
    enrollmentsByStatus: enrollmentsByStatus.map((row) => ({
      status: row.status,
      count: Number(row.count),
    })),
    eventsByType: eventsByType.map((row) => ({ type: row.event_type, count: Number(row.count) })),
    recentEnrollments,
    recentMessages,
    recentActivity,
  };
}
