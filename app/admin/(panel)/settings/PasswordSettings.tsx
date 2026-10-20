'use client';

import { useCallback, useEffect, useState } from 'react';
import { Password, ShieldCheck } from 'phosphor-react';
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  SkeletonRows,
  useToast,
} from '@/components/admin/ui';
import { relativeTime } from '@/lib/dates';

type SessionRow = {
  id: string;
  user_agent: string;
  ip: string;
  created_at: string;
  expires_at: string;
};

export default function PasswordSettings() {
  const toast = useToast();
  const [adminId, setAdminId] = useState('');
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth/session');
      const result = await response.json().catch(() => ({}));
      setAdminId(result.admin?.id ?? '');
      setSessions(result.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const change = async () => {
    setError('');

    if (next !== confirm) {
      setError('The two new passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: next, current_password: current }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Could not change your password.');
        setSaving(false);
        return;
      }

      // Changing the password revokes every session, including this one.
      toast.push('Password changed. Please sign in again.');
      window.location.href = '/admin/login';
    } catch {
      setError('Could not reach the server.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Change your password"
          description="Changing it signs you out of every device, including this one."
        />
        <div className="max-w-md space-y-4">
          <Field label="Current password" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </Field>

          <Field
            label="New password"
            required
            hint="At least 10 characters with an uppercase letter, a lowercase letter, and a number."
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
            />
          </Field>

          <Field label="Confirm new password" required>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </Field>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-sm text-accent"
            >
              {error}
            </p>
          ) : null}

          <Button
            onClick={() => void change()}
            loading={saving}
            disabled={!current || !next || !confirm}
          >
            <Password size={16} />
            Change password
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Your active sessions"
          description="Every device currently signed in as you."
        />
        {loading ? (
          <SkeletonRows rows={2} />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500">No active sessions found.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center gap-3 py-3">
                <ShieldCheck size={18} className="shrink-0 text-primary/40" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-slate-700">
                    {session.user_agent || 'Unknown device'}
                  </span>
                  <span className="block text-xs text-slate-400">
                    Signed in {relativeTime(session.created_at)}
                    {session.ip ? ` from ${session.ip}` : ''} · expires{' '}
                    {relativeTime(session.expires_at)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
