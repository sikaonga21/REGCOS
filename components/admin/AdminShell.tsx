'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Article,
  ArrowSquareOut,
  CalendarBlank,
  Database,
  Envelope,
  GearSix,
  HardDrives,
  House,
  ImageSquare,
  List,
  MagnifyingGlass,
  ShieldCheck,
  SignOut,
  SquaresFour,
  UsersThree,
  X,
} from 'phosphor-react';
import { Badge, IconButton, useToast } from '@/components/admin/ui';
import type { AdminUser } from '@/lib/auth/session';

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  description: string;
  manageOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <House size={19} />, description: 'Overview and activity' },
  { href: '/admin/blog', label: 'Blog', icon: <Article size={19} />, description: 'Write and publish posts' },
  {
    href: '/admin/calendar',
    label: 'Calendar',
    icon: <CalendarBlank size={19} />,
    description: 'Term dates and events',
  },
  {
    href: '/admin/enrollments',
    label: 'Enrollments',
    icon: <UsersThree size={19} />,
    description: 'Applications and admissions',
  },
  {
    href: '/admin/messages',
    label: 'Messages',
    icon: <Envelope size={19} />,
    description: 'Contact form inbox',
  },
  {
    href: '/admin/gallery',
    label: 'Gallery',
    icon: <SquaresFour size={19} />,
    description: 'Public photo gallery',
  },
  {
    href: '/admin/media',
    label: 'Media',
    icon: <ImageSquare size={19} />,
    description: 'Vercel Blob library',
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: <GearSix size={19} />,
    description: 'Site details, team, activity',
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  admin,
  connection,
  children,
}: {
  admin: AdminUser;
  connection: { database: boolean; blob: boolean };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  // Close the mobile drawer whenever navigation happens.
  useEffect(() => {
    setDrawerOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteQuery('');
        setPaletteOpen((open) => !open);
      }
      if (event.key === 'Escape') setPaletteOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } catch {
      toast.push('Could not sign out. Check your connection and try again.', 'error');
      setSigningOut(false);
    }
  }, [router, toast]);

  const paletteResults = useMemo(() => {
    const query = paletteQuery.trim().toLowerCase();
    if (!query) return NAV;
    return NAV.filter(
      (item) =>
        item.label.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    );
  }, [paletteQuery]);

  const current = NAV.find((item) => isActive(pathname, item.href));

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-primary-dark via-primary to-primary-dark">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 shadow-sm">
          <Image
            src="/images/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading text-sm font-bold leading-tight text-white">
            Regcos Academy
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-secondary">
            Admin panel
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-white/12 text-white'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-secondary" />
              ) : null}
              <span className={active ? 'text-secondary' : 'text-white/60 group-hover:text-white'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 px-5 py-4">
        <div className="space-y-1.5">
          <ConnectionRow
            icon={<Database size={13} />}
            label="Vercel Postgres"
            connected={connection.database}
          />
          <ConnectionRow
            icon={<HardDrives size={13} />}
            label="Vercel Blob"
            connected={connection.blob}
          />
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs font-medium text-white/60 transition hover:text-secondary"
        >
          <ArrowSquareOut size={14} />
          View live site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-primary-dark/50 backdrop-blur-sm"
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <IconButton
              label="Close navigation"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 z-10 text-white hover:bg-white/15"
            >
              <X size={18} />
            </IconButton>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <IconButton
              label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden"
            >
              <List size={20} />
            </IconButton>

            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-semibold text-primary-dark">
                {current?.label ?? 'Admin'}
              </p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {current?.description ?? 'Regcos Christian Academy'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPaletteQuery('');
                setPaletteOpen(true);
              }}
              className="hidden items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-500 transition hover:border-primary/40 hover:text-primary sm:flex"
            >
              <MagnifyingGlass size={14} />
              Jump to…
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-px font-sans text-[10px] font-semibold text-slate-500">
                Ctrl K
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {admin.name || admin.email}
                </p>
                <p className="text-[11px] capitalize text-slate-500">{admin.role}</p>
              </div>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary"
                aria-hidden="true"
              >
                {(admin.name || admin.email).charAt(0).toUpperCase()}
              </span>
              <IconButton
                label={signingOut ? 'Signing out' : 'Sign out'}
                variant="outline"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <SignOut size={16} />
              </IconButton>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">
          {!connection.database ? (
            <div className="mb-6 flex flex-wrap items-start gap-3 rounded-2xl border border-secondary/60 bg-secondary/15 px-4 py-3.5">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#7a5c00]" />
              <div className="min-w-0 flex-1 text-sm text-slate-700">
                <p className="font-semibold text-primary-dark">Database not connected</p>
                <p className="mt-0.5">
                  Add a Postgres store to this Vercel project, set <code>POSTGRES_URL</code>, then run{' '}
                  <code className="rounded bg-white/70 px-1 py-px font-mono text-xs">npm run db:setup</code>.
                </p>
              </div>
            </div>
          ) : null}

          {children}
        </main>
      </div>

      {/* Command palette */}
      {paletteOpen ? (
        <div className="fixed inset-0 z-[55] flex items-start justify-center bg-primary-dark/45 p-4 pt-[12vh] backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setPaletteOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
            tabIndex={-1}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Jump to a section"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3">
              <MagnifyingGlass size={18} className="shrink-0 text-slate-400" />
              <input
                autoFocus
                value={paletteQuery}
                onChange={(event) => setPaletteQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && paletteResults[0]) {
                    router.push(paletteResults[0].href);
                  }
                }}
                placeholder="Search sections…"
                className="w-full border-0 p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {paletteResults.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-slate-500">No matching section.</li>
              ) : (
                paletteResults.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-primary/6"
                    >
                      <span className="text-primary">{item.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-800">{item.label}</span>
                        <span className="block truncate text-xs text-slate-500">{item.description}</span>
                      </span>
                      {index === 0 ? <Badge tone="slate">Enter</Badge> : null}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConnectionRow({
  icon,
  label,
  connected,
}: {
  icon: ReactNode;
  label: string;
  connected: boolean;
}) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-medium text-white/60">
      <span className="text-white/40">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${connected ? 'bg-emerald-400' : 'bg-accent'}`}
        aria-hidden="true"
      />
      <span className="sr-only">{connected ? 'connected' : 'not connected'}</span>
    </p>
  );
}
