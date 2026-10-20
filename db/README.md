# Admin panel: database and storage setup

The admin panel at `/admin` runs on two Vercel storage products:

| What | Product | Environment variable |
|---|---|---|
| Content, applications, messages, admin accounts | **Vercel Postgres** (Neon) | `POSTGRES_URL` |
| Images and uploads | **Vercel Blob** | `BLOB_READ_WRITE_TOKEN` |

Until both are connected the panel still loads, but it says plainly which piece is
missing: the sidebar shows a red dot next to the one that is not connected, and
the API answers `503` rather than failing silently.

## 1. Create the two stores

In your Vercel project, go to **Storage**:

1. **Create → Postgres.** Accept the defaults and connect it to this project.
2. **Create → Blob.** Set access to **Public** (gallery and blog images are served
   to visitors). Include the **Development** environment so `vercel env pull`
   picks the token up.

Or from the CLI, in the project directory:

```bash
npx vercel link
npx vercel blob create-store Images --access public --yes
```

## 2. Pull the credentials locally

```bash
npx vercel env pull .env.local
```

That writes `POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`, and the related aliases.
`.env.local` is already gitignored. See `.env.example` for the full list.

If the Blob variables are missing, the store is not connected to the
**Development** environment — fix it from the store's **Projects** tab
(**⋯ → Update Project Connection**), then pull again.

## 3. Create the tables and the first admin

Add the first account's credentials to `.env.local`:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=a-long-password-with-Caps-and-9s
```

Then:

```bash
npm run db:setup
```

This is safe to re-run. It:

- applies `db/schema.sql` (every statement is idempotent);
- seeds `gallery_photos` from the photos already bundled in `lib/gallery.ts`, so
  the public gallery looks the same as before but is now editable;
- creates the first `owner` account, or resets the password of an existing one.

Sign in at `/admin/login`.

### Signing in to a fresh deployment

If you deploy before running the setup script, set `ADMIN_BOOTSTRAP_EMAIL` and
`ADMIN_BOOTSTRAP_PASSWORD` as environment variables in Vercel. The first time
someone signs in with exactly those credentials **and** `admin_users` is still
empty, the owner account is created. Once any account exists the bootstrap stops
working, so there is no standing back door. Remove the two variables afterwards.

You still need the tables, so run the schema once against the production
database — easiest is to point `POSTGRES_URL` at it locally and run
`npm run db:setup`.

## What is stored where

| Table | Holds | Shown at |
|---|---|---|
| `admin_users`, `admin_sessions` | Admin accounts and signed-in sessions | `/admin/settings?tab=team` |
| `blog_posts` | Blog posts, drafts, SEO fields | `/admin/blog` → `/blog` |
| `calendar_events` | Term dates, holidays, events | `/admin/calendar` → `/calendar` |
| `enrollments` | Enrollment form submissions, full payload in `payload` | `/admin/enrollments` |
| `contact_messages` | Contact form submissions | `/admin/messages` |
| `media_assets` | Metadata for files in Vercel Blob | `/admin/media` |
| `gallery_photos` | Public gallery, with ordering | `/admin/gallery` → `/gallery` |
| `site_settings` | Editable contact details and switches | `/admin/settings` |
| `audit_log` | Who changed what, and when | `/admin/settings?tab=activity` |

Images themselves live in Vercel Blob, never in Postgres. `media_assets` only
records the URL and metadata, which is why **Sync from Blob** on the media page
can rebuild the catalogue from the store.

## Notes on the implementation

- **Uploads go browser → Blob directly.** `/api/admin/media/upload` only mints a
  short-lived token (after checking the session), so uploads are not capped by
  the 4.5 MB serverless request body limit. Vercel's `onUploadCompleted` webhook
  cannot reach `localhost`, so the browser also reports the finished upload to
  `/api/admin/media`; the unique index on `url` makes the second write a no-op.
- **Sessions are opaque random tokens.** Only a SHA-256 digest is stored, so a
  database leak does not hand over working sessions. Passwords use scrypt with a
  per-password salt.
- **`proxy.ts` is a UX redirect, not the security boundary.** It only checks that
  a cookie exists. Every `/api/admin/*` route calls `requireAdmin()`, and
  `app/admin/(panel)/layout.tsx` validates the session against the database.

## Checks

```bash
npm run db:check    # schema.sql splits into runnable statements
npm run typecheck   # tsc --noEmit
npm run build
```
