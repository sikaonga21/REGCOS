'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Switch,
  Textarea,
  useToast,
} from '@/components/admin/ui';
import type { SiteSettings } from '@/lib/db/settings';

export default function SiteSettingsForm({
  settings,
  onSaved,
}: {
  settings: SiteSettings;
  onSaved: (next: SiteSettings) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.push(result.error ?? 'Could not save settings.', 'error');
      } else {
        toast.push('Settings saved.');
        onSaved(result.data);
        setForm(result.data);
      }
    } catch {
      toast.push('Could not reach the server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="School details"
          description="Used across the public site and in notification emails."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School name" className="sm:col-span-2">
            <Input value={form.school_name} onChange={(e) => update('school_name', e.target.value)} />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
          </Field>
          <Field label="Public email address">
            <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </Field>
          <Field label="Office hours">
            <Input value={form.office_hours} onChange={(e) => update('office_hours', e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Social links" description="Leave blank to hide a link from the site." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook">
            <Input
              type="url"
              value={form.facebook_url}
              onChange={(e) => update('facebook_url', e.target.value)}
              placeholder="https://facebook.com/…"
            />
          </Field>
          <Field label="Instagram">
            <Input
              type="url"
              value={form.instagram_url}
              onChange={(e) => update('instagram_url', e.target.value)}
              placeholder="https://instagram.com/…"
            />
          </Field>
          <Field label="YouTube" className="sm:col-span-2">
            <Input
              type="url"
              value={form.youtube_url}
              onChange={(e) => update('youtube_url', e.target.value)}
              placeholder="https://youtube.com/@…"
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Announcements and admissions"
          description="Quick switches you can flip without a redeploy."
        />
        <div className="space-y-5">
          <Field
            label="Announcement text"
            hint="Shown as a banner when the switch below is on."
          >
            <Textarea
              rows={2}
              value={form.announcement_text}
              onChange={(e) => update('announcement_text', e.target.value)}
              placeholder="Enrollment for the January 2027 term is now open."
            />
          </Field>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
            <span>
              <span className="block text-sm font-medium text-slate-700">Show the announcement</span>
              <span className="block text-xs text-slate-500">
                Turn on once the text above is ready.
              </span>
            </span>
            <Switch
              checked={form.announcement_active}
              onChange={(next) => update('announcement_active', next)}
              label="Show the announcement banner"
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
            <span>
              <span className="block text-sm font-medium text-slate-700">Enrollment is open</span>
              <span className="block text-xs text-slate-500">
                A record of whether you are currently accepting applications.
              </span>
            </span>
            <Switch
              checked={form.enrollment_open}
              onChange={(next) => update('enrollment_open', next)}
              label="Enrollment is open"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Notifications"
          description="Where a copy of each new enrollment application is sent."
        />
        <Field
          label="Notification email"
          hint="Falls back to the ADMIN_EMAIL environment variable, then the public email address. Sending also needs RESEND_API_KEY to be set."
        >
          <Input
            type="email"
            value={form.admin_notification_email}
            onChange={(e) => update('admin_notification_email', e.target.value)}
            placeholder="admissions@regcoschristianacademy.com"
          />
        </Field>
      </Card>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        {dirty ? (
          <p className="mr-auto text-xs font-medium text-[#7a5c00]">You have unsaved changes.</p>
        ) : (
          <p className="mr-auto text-xs text-slate-400">All changes saved.</p>
        )}
        <Button variant="outline" onClick={() => setForm(settings)} disabled={!dirty || saving}>
          Discard
        </Button>
        <Button onClick={() => void save()} loading={saving} disabled={!dirty}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
