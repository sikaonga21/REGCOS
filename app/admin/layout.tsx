'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  useEffect(() => {
    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Signed in successfully.');
      await loadSession();
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
    } else {
      setUser(null);
      setMessage('Signed out.');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Admin access</p>
          <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none placeholder:text-slate-500"
                placeholder="admin@yourdomain.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Access admin'}
            </button>
          </form>
          {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
          <p className="mt-6 text-xs text-slate-400">Use the Supabase user created for admin access.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Regcos</p>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/admin" className="text-sm text-slate-200 hover:text-cyan-300">Dashboard</Link>
            <Link href="/admin/blog" className="text-sm text-slate-200 hover:text-cyan-300">Blog</Link>
            <Link href="/admin/calendar" className="text-sm text-slate-200 hover:text-cyan-300">Calendar</Link>
          </nav>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
