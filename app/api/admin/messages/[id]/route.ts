import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import type { ContactMessage } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const STATUSES = ['unread', 'read', 'replied', 'archived'];

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/admin/messages/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const status = String(body.status ?? '');
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
  }

  try {
    const rows = await query<ContactMessage>(
      'update contact_messages set status = $2 where id = $1 returning *',
      [id, status]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });

    await recordAudit(guard.admin, `marked message ${status}`, 'contact_messages', id, rows[0].email);
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update message failed:', error);
    return NextResponse.json({ error: 'Unable to update the message.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/messages/[id]'>) {
  const guard = await requireAdmin({ manage: true });
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  try {
    const removed = await queryOne<{ email: string }>(
      'delete from contact_messages where id = $1 returning email',
      [id]
    );
    if (!removed) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });

    await recordAudit(guard.admin, 'deleted message', 'contact_messages', id, removed.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete message failed:', error);
    return NextResponse.json({ error: 'Unable to delete the message.' }, { status: 500 });
  }
}
