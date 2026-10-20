#!/usr/bin/env node
/**
 * One-shot setup for the Vercel Postgres database behind the admin panel.
 *
 *   npm run db:setup
 *
 * Applies db/schema.sql, seeds the gallery from lib/gallery.ts, and creates the
 * first admin user. Re-running is safe: the schema is idempotent and seeding
 * skips rows that already exist.
 *
 * Credentials come from the environment (or .env.local):
 *   POSTGRES_URL   — from your Vercel Postgres store (`vercel env pull`)
 *   ADMIN_EMAIL    — first admin's email
 *   ADMIN_PASSWORD — first admin's password
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const scrypt = promisify(scryptCallback);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- env ------------------------------------------------------------------

/** Minimal .env parser so the script needs no extra dependency. */
async function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(ROOT, name);
    if (!existsSync(file)) continue;

    const contents = await readFile(file, 'utf8');
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const equals = line.indexOf('=');
      if (equals === -1) continue;

      const key = line.slice(0, equals).trim();
      let value = line.slice(equals + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

// --- sql helpers ----------------------------------------------------------

/**
 * Splits a SQL file into statements. The Neon HTTP endpoint accepts one
 * statement per request, and a naive split on ';' would cut through the
 * dollar-quoted function bodies in our schema, so track quoting state.
 */
function splitStatements(source) {
  const statements = [];
  let current = '';
  let index = 0;
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      current += char;
      index += 1;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        current += '*/';
        index += 2;
        continue;
      }
      current += char;
      index += 1;
      continue;
    }

    if (dollarTag) {
      if (source.startsWith(dollarTag, index)) {
        current += dollarTag;
        index += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += char;
      index += 1;
      continue;
    }

    if (inSingleQuote) {
      if (char === "'" && next === "'") {
        current += "''";
        index += 2;
        continue;
      }
      if (char === "'") inSingleQuote = false;
      current += char;
      index += 1;
      continue;
    }

    if (char === '-' && next === '-') {
      inLineComment = true;
      current += '--';
      index += 2;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      current += '/*';
      index += 2;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      current += char;
      index += 1;
      continue;
    }

    if (char === '$') {
      const match = /^\$[A-Za-z_]*\$/.exec(source.slice(index));
      if (match) {
        dollarTag = match[0];
        current += dollarTag;
        index += dollarTag.length;
        continue;
      }
    }

    if (char === ';') {
      if (current.trim()) statements.push(current.trim());
      current = '';
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const params = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
  const derived = await scrypt(password.normalize('NFKC'), salt, 64, params);
  return ['scrypt', params.N, params.r, params.p, salt.toString('hex'), derived.toString('hex')].join(':');
}

/** Pulls the static gallery list out of lib/gallery.ts without a TS build step. */
async function readStaticGallery() {
  const source = await readFile(path.join(ROOT, 'lib', 'gallery.ts'), 'utf8');
  const start = source.indexOf('export const galleryPhotos');
  if (start === -1) return [];

  const arrayStart = source.indexOf('[', start);
  const arrayEnd = source.indexOf('\n];', arrayStart);
  if (arrayStart === -1 || arrayEnd === -1) return [];

  const body = source.slice(arrayStart, arrayEnd + 2);
  const photos = [];
  const entryPattern = /\{([^{}]*)\}/g;
  let match;

  while ((match = entryPattern.exec(body)) !== null) {
    const entry = match[1];
    const field = (name) => {
      const found = new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`).exec(entry);
      return found ? found[1].replace(/\\'/g, "'") : '';
    };
    const numberField = (name) => {
      const found = new RegExp(`${name}:\\s*(\\d+)`).exec(entry);
      return found ? Number(found[1]) : 0;
    };

    const src = field('src');
    if (!src) continue;

    photos.push({
      src,
      alt: field('alt'),
      caption: field('caption'),
      category: field('category'),
      width: numberField('width') || 1920,
      height: numberField('height') || 1280,
    });
  }

  return photos;
}

const HIGHLIGHT_SOURCES = new Set([
  '/images/gallery/classroom-hands-up.jpg',
  '/images/gallery/violin-ensemble.jpg',
  '/images/gallery/ict-lab-duo.jpg',
  '/images/gallery/playground-group.jpg',
  '/images/gallery/grace-before-meal.jpg',
]);

// --- main -----------------------------------------------------------------

async function main() {
  await loadEnvFiles();

  const connectionString = [
    'POSTGRES_URL',
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING',
    'DATABASE_URL_UNPOOLED',
  ]
    .map((key) => process.env[key])
    .find((value) => value && value.length > 0);

  if (!connectionString) {
    console.error(
      [
        '',
        'No Postgres connection string found.',
        '',
        'Create a Postgres store in your Vercel project (Storage -> Create -> Postgres),',
        'then pull the credentials into this project:',
        '',
        '    npx vercel link',
        '    npx vercel env pull .env.local',
        '',
        'Or set POSTGRES_URL in .env.local by hand.',
        '',
      ].join('\n')
    );
    process.exit(1);
  }

  const sql = neon(connectionString);

  console.log('→ Applying db/schema.sql');
  const schema = await readFile(path.join(ROOT, 'db', 'schema.sql'), 'utf8');
  const statements = splitStatements(schema);

  for (const [index, statement] of statements.entries()) {
    try {
      await sql.query(statement);
    } catch (error) {
      console.error(`\n✗ Statement ${index + 1} failed:\n${statement.slice(0, 300)}\n`);
      throw error;
    }
  }
  console.log(`  ${statements.length} statements applied.`);

  // Gallery seed -----------------------------------------------------------
  const [{ count: galleryCount }] = await sql.query('select count(*)::int as count from gallery_photos');
  if (galleryCount === 0) {
    const photos = await readStaticGallery();
    for (const [index, photo] of photos.entries()) {
      await sql.query(
        `insert into gallery_photos (src, alt, caption, category, width, height, sort_order, published, highlight)
         values ($1, $2, $3, $4, $5, $6, $7, true, $8)
         on conflict do nothing`,
        [
          photo.src,
          photo.alt,
          photo.caption,
          photo.category,
          photo.width,
          photo.height,
          index * 10,
          HIGHLIGHT_SOURCES.has(photo.src),
        ]
      );
    }
    console.log(`→ Seeded ${photos.length} gallery photos from lib/gallery.ts`);
  } else {
    console.log(`→ Gallery already has ${galleryCount} photos; skipping seed.`);
  }

  // Admin user -------------------------------------------------------------
  const [{ count: adminCount }] = await sql.query('select count(*)::int as count from admin_users');
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (adminCount === 0) {
    if (!email || !password) {
      console.log(
        [
          '',
          '⚠ No admin user exists yet and ADMIN_EMAIL / ADMIN_PASSWORD are not set.',
          '  Add them to .env.local and run this script again:',
          '',
          '    ADMIN_EMAIL=you@example.com',
          '    ADMIN_PASSWORD=a-long-password',
          '',
        ].join('\n')
      );
    } else {
      await sql.query(
        `insert into admin_users (email, name, password_hash, role)
         values ($1, $2, $3, 'owner')`,
        [email, email.split('@')[0], await hashPassword(password)]
      );
      console.log(`→ Created owner account for ${email}`);
    }
  } else if (email && password) {
    const existing = await sql.query('select id from admin_users where email = $1', [email]);
    if (existing.length === 0) {
      await sql.query(
        `insert into admin_users (email, name, password_hash, role) values ($1, $2, $3, 'admin')`,
        [email, email.split('@')[0], await hashPassword(password)]
      );
      console.log(`→ Added admin account for ${email}`);
    } else {
      await sql.query('update admin_users set password_hash = $2 where email = $1', [
        email,
        await hashPassword(password),
      ]);
      console.log(`→ Reset password for existing account ${email}`);
    }
  } else {
    console.log(`→ ${adminCount} admin account(s) already present.`);
  }

  console.log('\n✓ Database ready. Sign in at /admin/login\n');
}

// Exported so scripts/test-sql-split.mjs can check the splitter without a database.
export { splitStatements };

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error('\n✗ Setup failed:', error.message);
    process.exit(1);
  });
}
