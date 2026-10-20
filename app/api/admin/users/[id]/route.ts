import { NextResponse, type NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db/client';
import { recordAudit, requireAdmin } from '@/lib/auth/guard';
import { hashPassword, validatePasswordStrength, verifyPassword } from '@/lib/auth/password';
import { revokeAllSessions, type AdminUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const ROLES = ['owner', 'admin', 'editor'];
const PUBLIC_COLUMNS = 'id, email, name, role, active, last_login_at, created_at';

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/admin/users/[id]'>) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  const isSelf = id === guard.admin.id;
  const canManageOthers = guard.admin.role === 'owner' || guard.admin.role === 'admin';

  if (!isSelf && !canManageOthers) {
    return NextResponse.json({ error: 'Your role does not allow this action.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const target = await queryOne<{ id: string; email: string; role: string; password_hash: string }>(
      'select id, email, role, password_hash from admin_users where id = $1',
      [id]
    );
    if (!target) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    // Password change ------------------------------------------------------
    if (typeof body.password === 'string' && body.password !== '') {
      const weak = validatePasswordStrength(body.password);
      if (weak) return NextResponse.json({ error: weak }, { status: 400 });

      // Changing your own password requires the current one; an admin resetting
      // someone else's does not, which is what makes account recovery possible.
      if (isSelf) {
        const current = String(body.current_password ?? '');
        if (!current || !(await verifyPassword(current, target.password_hash))) {
          return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 400 });
        }
      } else if (!canManageOthers) {
        return NextResponse.json({ error: 'Your role does not allow this action.' }, { status: 403 });
      }

      await query('update admin_users set password_hash = $2 where id = $1', [
        id,
        await hashPassword(body.password),
      ]);

      // Force every other device to sign in again with the new password.
      await revokeAllSessions(id);
      await recordAudit(guard.admin, 'changed password', 'admin_users', id, target.email);

      return NextResponse.json({ ok: true, passwordChanged: true });
    }

    // Profile / role / active ---------------------------------------------
    const updates: string[] = [];
    const values: unknown[] = [id];

    if (typeof body.name === 'string') {
      values.push(body.name.trim());
      updates.push(`name = $${values.length}`);
    }

    if (typeof body.role === 'string' && body.role !== target.role) {
      if (!canManageOthers) {
        return NextResponse.json({ error: 'Your role does not allow this action.' }, { status: 403 });
      }
      if (!ROLES.includes(body.role)) {
        return NextResponse.json({ error: 'Unknown role.' }, { status: 400 });
      }
      if ((body.role === 'owner' || target.role === 'owner') && guard.admin.role !== 'owner') {
        return NextResponse.json({ error: 'Only an owner can change owner access.' }, { status: 403 });
      }
      if (isSelf) {
        return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
      }
      values.push(body.role);
      updates.push(`role = $${values.length}`);
    }

    if (typeof body.active === 'boolean') {
      if (!canManageOthers) {
        return NextResponse.json({ error: 'Your role does not allow this action.' }, { status: 403 });
      }
      if (isSelf && !body.active) {
        return NextResponse.json({ error: 'You cannot deactivate your own account.' }, { status: 400 });
      }
      if (target.role === 'owner' && guard.admin.role !== 'owner') {
        return NextResponse.json({ error: 'Only an owner can deactivate an owner.' }, { status: 403 });
      }
      values.push(body.active);
      updates.push(`active = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const rows = await query<AdminUser>(
      `update admin_users set ${updates.join(', ')} where id = $1 returning ${PUBLIC_COLUMNS}`,
      values
    );

    // A deactivated account should lose its live sessions immediately.
    if (body.active === false) await revokeAllSessions(id);

    await recordAudit(guard.admin, 'updated account', 'admin_users', id, target.email);
    return NextResponse.json({ data: rows[0] });
  } catch (error) {
    console.error('Update admin failed:', error);
    return NextResponse.json({ error: 'Unable to update that account.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/users/[id]'>) {
  const guard = await requireAdmin({ manage: true });
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;

  if (id === guard.admin.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  try {
    const target = await queryOne<{ email: string; role: string }>(
      'select email, role from admin_users where id = $1',
      [id]
    );
    if (!target) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    if (target.role === 'owner') {
      const owners = await queryOne<{ count: number }>(
        "select count(*)::int as count from admin_users where role = 'owner'"
      );
      if (guard.admin.role !== 'owner') {
        return NextResponse.json({ error: 'Only an owner can remove an owner.' }, { status: 403 });
      }
      if ((owners?.count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'This is the last owner account — promote someone else first.' },
          { status: 400 }
        );
      }
    }

    await query('delete from admin_users where id = $1', [id]);
    await recordAudit(guard.admin, 'removed account', 'admin_users', id, target.email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete admin failed:', error);
    return NextResponse.json({ error: 'Unable to remove that account.' }, { status: 500 });
  }
}
