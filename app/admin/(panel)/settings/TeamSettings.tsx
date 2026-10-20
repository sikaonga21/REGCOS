'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash, UserPlus, UsersThree } from 'phosphor-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorNotice,
  Field,
  IconButton,
  Input,
  Modal,
  Select,
  SkeletonRows,
  StatusBadge,
  Switch,
  useToast,
} from '@/components/admin/ui';
import { relativeTime } from '@/lib/dates';

type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor';
  active: boolean;
  last_login_at: string | null;
  created_at: string;
  session_count: number;
};

const ROLE_HELP: Record<TeamMember['role'], string> = {
  owner: 'Full access, including owner accounts.',
  admin: 'Everything except managing owners.',
  editor: 'Content and admissions, but not settings or team.',
};

export default function TeamSettings() {
  const toast = useToast();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Unable to load the team.');
      } else {
        setMembers(result.data ?? []);
        setCurrentUserId(result.currentUserId ?? '');
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

  const patch = async (member: TeamMember, body: Record<string, unknown>, message: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not update that account.', 'error');
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

  const confirmRemove = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${removing.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not remove that account.', 'error');
      } else {
        toast.push('Account removed.');
        setRemoving(null);
        await load();
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <CardHeader
            title="Admin accounts"
            description="Everyone who can sign in to this panel."
            actions={
              <Button onClick={() => setInviting(true)}>
                <UserPlus size={16} />
                Add account
              </Button>
            }
          />

          {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

          {loading ? (
            <SkeletonRows rows={3} />
          ) : members.length === 0 ? (
            <EmptyState
              icon={<UsersThree size={22} />}
              title="No accounts found"
              description="Run npm run db:setup to create the first owner account."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {members.map((member) => {
                const isSelf = member.id === currentUserId;
                return (
                  <li key={member.id} className="flex flex-wrap items-center gap-3 py-3.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary"
                      aria-hidden="true"
                    >
                      {(member.name || member.email).charAt(0).toUpperCase()}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-slate-800">
                          {member.name || member.email.split('@')[0]}
                        </span>
                        <StatusBadge status={member.role} />
                        {isSelf ? <Badge tone="slate">You</Badge> : null}
                        {!member.active ? <Badge tone="red">Disabled</Badge> : null}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{member.email}</span>
                      <span className="block text-xs text-slate-400">
                        {member.last_login_at
                          ? `Last signed in ${relativeTime(member.last_login_at)}`
                          : 'Has not signed in yet'}
                        {member.session_count > 0
                          ? ` · ${member.session_count} active session${member.session_count === 1 ? '' : 's'}`
                          : ''}
                      </span>
                    </span>

                    <span className="flex flex-wrap items-center gap-2">
                      <Select
                        value={member.role}
                        disabled={busy || isSelf}
                        aria-label={`Role for ${member.email}`}
                        onChange={(event) =>
                          void patch(member, { role: event.target.value }, 'Role updated.')
                        }
                        className="w-auto py-1.5 text-xs"
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </Select>

                      <Switch
                        checked={member.active}
                        disabled={busy || isSelf}
                        label={`${member.active ? 'Disable' : 'Enable'} ${member.email}`}
                        onChange={(next) =>
                          void patch(
                            member,
                            { active: next },
                            next ? 'Account enabled.' : 'Account disabled and signed out.'
                          )
                        }
                      />

                      <IconButton
                        label={`Remove ${member.email}`}
                        disabled={isSelf}
                        onClick={() => setRemoving(member)}
                        className="text-accent hover:bg-accent/10"
                      >
                        <Trash size={15} />
                      </IconButton>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 bg-bg-light px-5 py-4 sm:px-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            What each role can do
          </h3>
          <dl className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {(['owner', 'admin', 'editor'] as const).map((role) => (
              <div key={role}>
                <dt className="text-xs font-semibold capitalize text-slate-700">{role}</dt>
                <dd className="text-xs text-slate-500">{ROLE_HELP[role]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      {inviting ? (
        <InviteDialog
          onClose={() => setInviting(false)}
          onCreated={() => {
            setInviting(false);
            void load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this account?"
        message={`${removing?.email ?? 'This account'} will lose access immediately and all of their sessions will end.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}

function InviteDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('editor');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Could not create that account.');
        setSaving(false);
        return;
      }

      toast.push(`Account created for ${email}.`);
      onCreated();
    } catch {
      setError('Could not reach the server.');
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add an admin account"
      description="Share the password with them directly; they can change it after signing in."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void create()} loading={saving}>
            Create account
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Email address" required>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teacher@regcoschristianacademy.com"
          />
        </Field>

        <Field label="Name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Mrs Chanda Mutale"
          />
        </Field>

        <Field label="Role">
          <Select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="editor">Editor — content and admissions</option>
            <option value="admin">Admin — everything except owners</option>
            <option value="owner">Owner — full access</option>
          </Select>
        </Field>

        <Field
          label="Temporary password"
          required
          hint="At least 10 characters with an uppercase letter, a lowercase letter, and a number."
        >
          <Input
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Choose something long"
          />
        </Field>

        {error ? (
          <p role="alert" className="rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-sm text-accent">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
