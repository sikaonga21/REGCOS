'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClockCounterClockwise, GearSix, Password, UsersThree } from 'phosphor-react';
import { Card, ErrorNotice, PageHeader, SkeletonRows } from '@/components/admin/ui';
import SiteSettingsForm from './SiteSettingsForm';
import TeamSettings from './TeamSettings';
import ActivityLog from './ActivityLog';
import PasswordSettings from './PasswordSettings';
import type { SiteSettings } from '@/lib/db/settings';

const TABS = [
  { value: 'site', label: 'Site details', icon: <GearSix size={15} /> },
  { value: 'team', label: 'Team', icon: <UsersThree size={15} /> },
  { value: 'password', label: 'Your password', icon: <Password size={15} /> },
  { value: 'activity', label: 'Activity log', icon: <ClockCounterClockwise size={15} /> },
] as const;

type Tab = (typeof TABS)[number]['value'];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get('tab');
  const initialTab = TABS.some((tab) => tab.value === requested) ? (requested as Tab) : 'site';

  const [tab, setTab] = useState<Tab>(initialTab);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/settings');
      const result = await response.json().catch(() => ({}));

      if (!response.ok) setError(result.error ?? 'Unable to load settings.');
      else setSettings(result.data);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changeTab = (next: Tab) => {
    setTab(next);
    // Keep the tab in the URL so the dashboard can deep-link to the activity log.
    router.replace(next === 'site' ? '/admin/settings' : `/admin/settings?tab=${next}`, {
      scroll: false,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Site details, admin accounts, and a record of every change."
      />

      <div className="mb-6 flex flex-wrap gap-1.5" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => changeTab(item.value)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              tab === item.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-primary'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {error ? <ErrorNotice message={error} onRetry={() => void load()} /> : null}

      {tab === 'site' ? (
        loading || !settings ? (
          <Card>
            <SkeletonRows rows={6} />
          </Card>
        ) : (
          <SiteSettingsForm settings={settings} onSaved={setSettings} />
        )
      ) : null}

      {tab === 'team' ? <TeamSettings /> : null}
      {tab === 'password' ? <PasswordSettings /> : null}
      {tab === 'activity' ? <ActivityLog /> : null}
    </div>
  );
}
