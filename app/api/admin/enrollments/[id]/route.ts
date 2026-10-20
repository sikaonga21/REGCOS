import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import type { Enrollment } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'reviewing', 'accepted', 'waitlist', 'declined'];

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/admin/enrollments/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const row = await queryOne<Enrollment>('select * from enrollments where id = $1', [id]);
    if (!row) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error('Fetch enrollment failed:', error);
    return NextResponse.json({ error: 'Unable to load the application.' }, { status: 500 });
  }
}

/** Status moves and reviewer notes. The submitted application itself is never edited. */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/admin/enrollments/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: unknown[] = [id];

  if (typeof body.status === 'string') {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
    }
    values.push(body.status);
    updates.push(`status = $${values.length}`);
  }

  if (typeof body.notes === 'string') {
    values.push(body.notes);
    updates.push(`notes = $${values.length}`);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  try {
    const rows = await query<Enrollment>(
      `update enrollments set ${updates.join(', ')} where id = $1 returning *`,
      values
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    await recordAudit(
      guard.admin,
      typeof body.status === 'string' ? `moved application to ${body.status}` : 'updated application notes',
      'enrollments',
      id,
      rows[0].child_name
    );

    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update enrollment failed:', error);
    return NextResponse.json({ error: 'Unable to update the application.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/enrollments/[id]'>) {
  const guard = await requireAdmin({ manage: true });
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const removed = await queryOne<{ child_name: string }>(
      'delete from enrollments where id = $1 returning child_name',
      [id]
    );
    if (!removed) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'deleted application', 'enrollments', id, removed.child_name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete enrollment failed:', error);
    return NextResponse.json({ error: 'Unable to delete the application.' }, { status: 500 });
  }
}
