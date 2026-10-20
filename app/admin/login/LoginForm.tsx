'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Eye, EyeSlash, Lock, ShieldCheck, Warning } from 'phosphor-react';
import { Button, Field, Input } from '@/components/admin/ui';

export default function LoginForm({
  next,
  databaseConnected,
}: {
  next: string;
  databaseConnected: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Could not sign in. Please try again.');
        setLoading(false);
        return;
      }

      // A full refresh lets the server layout pick up the new session cookie.
      router.replace(next);
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-[#02204a] px-4 py-10">
      {/* Decorative wash in the brand yellow — purely presentational. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-secondary"
        >
          <ArrowLeft size={16} />
          Back to the website
        </Link>

        <div className="rounded-3xl border border-white/15 bg-white/95 p-7 shadow-2xl backdrop-blur sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-bg-light">
              <Image
                src="/images/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/60">
                Regcos Christian Academy
              </p>
              <h1 className="font-heading text-xl font-bold text-primary-dark">Admin sign in</h1>
            </div>
          </div>

          {!databaseConnected ? (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-secondary/60 bg-secondary/15 px-3.5 py-3">
              <Warning size={18} className="mt-0.5 shrink-0 text-[#7a5c00]" />
              <p className="text-xs leading-relaxed text-slate-700">
                <span className="font-semibold text-primary-dark">Database not connected.</span> Add a
                Postgres store to this Vercel project, set <code>POSTGRES_URL</code>, then run{' '}
                <code className="rounded bg-white/70 px-1 font-mono">npm run db:setup</code> to create
                your first account.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email address" required>
              <Input
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@regcoschristianacademy.com"
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="••••••••••"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-primary"
                >
                  {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-2.5 text-sm text-accent"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" loading={loading} className="w-full" size="md">
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading ? <Lock size={16} /> : null}
            </Button>
          </form>

          <p className="mt-6 flex items-start gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary/50" />
            Sessions last seven days and are stored in your Vercel Postgres database. Signing out ends
            the session on the server.
          </p>
        </div>
      </div>
    </main>
  );
}
