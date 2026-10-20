-- Regcos Christian Academy — admin panel schema (Vercel Postgres / Neon)
-- Safe to re-run: every statement is idempotent.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin users and sessions
-- ---------------------------------------------------------------------------

create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null default '',
  password_hash text not null,
  role          text not null default 'editor' check (role in ('owner', 'admin', 'editor')),
  active        boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists admin_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references admin_users(id) on delete cascade,
  token_hash text not null unique,
  user_agent text not null default '',
  ip         text not null default '',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_user_idx on admin_sessions (user_id);
create index if not exists admin_sessions_expiry_idx on admin_sessions (expires_at);

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------

create table if not exists blog_posts (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  slug               text not null unique,
  excerpt            text not null default '',
  content            text not null default '',
  category           text not null default 'School News',
  author             text not null default 'The Regcos Team',
  read_minutes       integer not null default 4,
  featured_image     text,
  featured_image_alt text not null default '',
  featured_images    jsonb not null default '[]'::jsonb,
  tags               jsonb not null default '[]'::jsonb,
  seo_title          text not null default '',
  seo_description    text not null default '',
  status             text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured        boolean not null default false,
  view_count         integer not null default 0,
  published_at       timestamptz,
  created_by         uuid references admin_users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists blog_posts_status_idx on blog_posts (status, published_at desc nulls last);
create index if not exists blog_posts_category_idx on blog_posts (category);

-- ---------------------------------------------------------------------------
-- Calendar
-- ---------------------------------------------------------------------------

create table if not exists calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text not null default '',
  location    text not null default '',
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  all_day     boolean not null default false,
  event_type  text not null default 'school' check (event_type in ('school', 'holiday', 'event', 'meeting', 'deadline')),
  status      text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  color       text not null default '#063B82',
  created_by  uuid references admin_users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists calendar_events_start_idx on calendar_events (start_at);

-- ---------------------------------------------------------------------------
-- Enrollment applications (previously email-only)
-- ---------------------------------------------------------------------------

create table if not exists enrollments (
  id            uuid primary key default gen_random_uuid(),
  child_name    text not null,
  child_dob     text not null default '',
  gender        text not null default '',
  guardian_name text not null default '',
  email         text not null default '',
  phone         text not null default '',
  start_date    text not null default '',
  status        text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'waitlist', 'declined')),
  notes         text not null default '',
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists enrollments_status_idx on enrollments (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------

create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  email      text not null default '',
  phone      text not null default '',
  subject    text not null default '',
  message    text not null default '',
  status     text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on contact_messages (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Media library (metadata; the files themselves live in Vercel Blob)
-- ---------------------------------------------------------------------------

create table if not exists media_assets (
  id           uuid primary key default gen_random_uuid(),
  url          text not null unique,
  pathname     text not null default '',
  filename     text not null default '',
  content_type text not null default '',
  size_bytes   bigint not null default 0,
  alt          text not null default '',
  folder       text not null default 'uploads',
  uploaded_by  uuid references admin_users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists media_assets_folder_idx on media_assets (folder, created_at desc);

-- ---------------------------------------------------------------------------
-- Gallery (drives the public gallery page)
-- ---------------------------------------------------------------------------

create table if not exists gallery_photos (
  id         uuid primary key default gen_random_uuid(),
  src        text not null,
  alt        text not null default '',
  caption    text not null default '',
  category   text not null default 'Classrooms',
  width      integer not null default 1920,
  height     integer not null default 1280,
  sort_order integer not null default 0,
  published  boolean not null default true,
  highlight  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_photos_order_idx on gallery_photos (published, sort_order, created_at);

-- ---------------------------------------------------------------------------
-- Site settings (key/value) and audit log
-- ---------------------------------------------------------------------------

create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null default '""'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id          bigserial primary key,
  actor_id    uuid references admin_users(id) on delete set null,
  actor_email text not null default '',
  action      text not null,
  entity      text not null default '',
  entity_id   text not null default '',
  detail      text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_created_idx on audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function touch_updated_at() returns trigger as $touch$
begin
  new.updated_at = now();
  return new;
end;
$touch$ language plpgsql;

do $triggers$
declare
  t text;
begin
  for t in
    select unnest(array[
      'admin_users', 'blog_posts', 'calendar_events', 'enrollments',
      'contact_messages', 'gallery_photos'
    ])
  loop
    execute format('drop trigger if exists %I_touch on %I', t, t);
    execute format(
      'create trigger %I_touch before update on %I for each row execute function touch_updated_at()',
      t, t
    );
  end loop;
end
$triggers$;
