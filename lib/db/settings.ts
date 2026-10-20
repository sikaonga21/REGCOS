import { isDatabaseConfigured, query, sql } from '@/lib/db/client';

/**
 * Site settings the admin can edit without a redeploy. Defaults mirror what is
 * currently hard-coded across the public pages, so an empty table behaves exactly
 * like the site does today.
 */
export const SETTINGS_DEFAULTS = {
  school_name: 'Regcos Christian Academy',
  tagline: 'Nurturing hearts, minds, and futures',
  phone: '+260 975 141 977',
  whatsapp: '+260 975 141 977',
  email: 'admin@regcoschristianacademy.com',
  address: 'Stand No. 12305, Woodlands, Lusaka, Zambia',
  office_hours: 'Monday – Friday, 07:00 – 17:00',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  announcement_text: '',
  announcement_active: false,
  enrollment_open: true,
  admin_notification_email: '',
} as const;

export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;
export type SiteSettings = {
  [K in SettingsKey]: (typeof SETTINGS_DEFAULTS)[K] extends boolean ? boolean : string;
};

export const SETTINGS_KEYS = Object.keys(SETTINGS_DEFAULTS) as SettingsKey[];

/** Reads all settings, falling back to defaults for anything unset. */
export async function getSettings(): Promise<SiteSettings> {
  const settings = { ...SETTINGS_DEFAULTS } as SiteSettings;
  if (!isDatabaseConfigured) return settings;

  try {
    const rows = await query<{ key: string; value: unknown }>('select key, value from site_settings');
    for (const row of rows) {
      if (SETTINGS_KEYS.includes(row.key as SettingsKey)) {
        (settings as Record<string, unknown>)[row.key] = row.value;
      }
    }
  } catch {
    // Table may not exist yet; defaults are a safe answer.
  }

  return settings;
}

/** Upserts only recognised keys, so a stray field in the request body is ignored. */
export async function saveSettings(patch: Record<string, unknown>): Promise<SiteSettings> {
  for (const key of SETTINGS_KEYS) {
    if (!(key in patch)) continue;

    const incoming = patch[key];
    const expectsBoolean = typeof SETTINGS_DEFAULTS[key] === 'boolean';
    const value = expectsBoolean ? Boolean(incoming) : String(incoming ?? '');

    await sql`
      insert into site_settings (key, value)
      values (${key}, ${JSON.stringify(value)}::jsonb)
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
  }

  return getSettings();
}
