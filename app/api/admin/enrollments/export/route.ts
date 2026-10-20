import { type NextRequest } from 'next/server';
import { query } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import type { Enrollment } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  'created_at',
  'status',
  'child_name',
  'child_dob',
  'gender',
  'guardian_name',
  'email',
  'phone',
  'start_date',
  'notes',
] as const;

/**
 * Escapes a CSV field. The leading apostrophe on formula-looking values stops
 * spreadsheet apps from executing them when the export is opened.
 */
function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const status = new URL(request.url).searchParams.get('status') ?? '';
  const filtered = ['new', 'reviewing', 'accepted', 'waitlist', 'declined'].includes(status);

  const rows = await query<Enrollment>(
    `select * from enrollments ${filtered ? 'where status = $1' : ''} order by created_at desc`,
    filtered ? [status] : []
  );

  // Every question on the enrollment form lands in `payload`; union the keys so
  // the export carries the full application rather than just the summary columns.
  const extraKeys = [
    ...new Set(
      rows.flatMap((row) =>
        row.payload && typeof row.payload === 'object' ? Object.keys(row.payload) : []
      )
    ),
  ].sort();

  const header = [...COLUMNS, ...extraKeys].map(csvCell).join(',');
  const body = rows
    .map((row) =>
      [
        ...COLUMNS.map((column) => csvCell(row[column])),
        ...extraKeys.map((key) => csvCell((row.payload as Record<string, unknown>)?.[key])),
      ].join(',')
    )
    .join('\r\n');

  await recordAudit(guard.admin, 'exported applications', 'enrollments', '', `${rows.length} row(s)`);

  const filename = `regcos-enrollments-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(`﻿${header}\r\n${body}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
