#!/usr/bin/env node
/**
 * Checks that db/schema.sql splits into runnable statements without cutting
 * through dollar-quoted function bodies. Runs without a database.
 *
 *   node scripts/test-sql-split.mjs
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitStatements } from './db-setup.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = await readFile(path.join(ROOT, 'db', 'schema.sql'), 'utf8');
const statements = splitStatements(schema);

let failures = 0;
const fail = (message) => {
  console.error(`✗ ${message}`);
  failures += 1;
};

console.log(`Parsed ${statements.length} statements.`);

// Every dollar-quote tag must be balanced inside the statement that opens it.
for (const [index, statement] of statements.entries()) {
  const tags = statement.match(/\$[A-Za-z_]*\$/g) ?? [];
  const counts = new Map();
  for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);

  for (const [tag, count] of counts) {
    if (count % 2 !== 0) {
      fail(`statement ${index + 1} has an unbalanced ${tag} quote:\n${statement.slice(0, 200)}`);
    }
  }
}

// The two dollar-quoted blocks must each survive as a single statement.
const touchFn = statements.filter((s) => s.includes('create or replace function touch_updated_at'));
if (touchFn.length !== 1) fail(`expected 1 touch_updated_at statement, got ${touchFn.length}`);
else if (!touchFn[0].includes('language plpgsql')) fail('touch_updated_at lost its language clause');

const triggerBlock = statements.filter((s) => s.trimStart().startsWith('do $triggers$'));
if (triggerBlock.length !== 1) fail(`expected 1 trigger DO block, got ${triggerBlock.length}`);
else if (!triggerBlock[0].includes('create trigger')) fail('trigger DO block lost its body');

// No statement should be only a comment or stray punctuation.
for (const [index, statement] of statements.entries()) {
  const stripped = statement
    .replace(/--[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length === 0) fail(`statement ${index + 1} is empty after stripping comments`);
}

// Sanity: the tables the app queries must all be created.
const expectedTables = [
  'admin_users',
  'admin_sessions',
  'blog_posts',
  'calendar_events',
  'enrollments',
  'contact_messages',
  'media_assets',
  'gallery_photos',
  'site_settings',
  'audit_log',
];

for (const table of expectedTables) {
  if (!statements.some((s) => s.includes(`create table if not exists ${table}`))) {
    fail(`schema is missing a create table for ${table}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}

console.log('✓ schema.sql splits cleanly and defines every expected table.');
