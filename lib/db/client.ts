import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Vercel Postgres connection.
 *
 * Vercel provisions Postgres through its Neon integration, which injects several
 * aliases of the same URL. We accept all of them, so the app works whether the store
 * was attached as "Vercel Postgres", as "Neon", or wired up by hand for local dev.
 *
 * `POSTGRES_URL` is the pooled URL and is the one serverless functions should use.
 */
const CONNECTION_ENV_KEYS = [
  'POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL_UNPOOLED',
] as const;

const connectionString = CONNECTION_ENV_KEYS.map((key) => process.env[key]).find(
  (value): value is string => typeof value === 'string' && value.length > 0
);

export const isDatabaseConfigured = Boolean(connectionString);

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'No Postgres connection string found. Set POSTGRES_URL (or DATABASE_URL) from your Vercel Postgres store — see db/README.md.'
    );
    this.name = 'DatabaseNotConfiguredError';
  }
}

function unconfigured(): never {
  throw new DatabaseNotConfiguredError();
}

/**
 * Tagged-template query function over HTTP. Interpolated values become bound
 * parameters rather than inlined text, so `sql`select ... where id = ${id}`` is
 * injection-safe. Since driver v1 it can *only* be called as a template tag —
 * use `query()` below for manually numbered placeholders.
 */
export const sql: NeonQueryFunction<false, false> =
  connectionString ? neon(connectionString) : (Object.assign(unconfigured, {
    query: unconfigured,
    transaction: unconfigured,
    unsafe: unconfigured,
  }) as unknown as NeonQueryFunction<false, false>);

/** Run a manually parameterised query: `query('select * from t where id = $1', [id])`. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!isDatabaseConfigured) unconfigured();
  return (await sql.query(text, params as never[])) as T[];
}

/** Returns the first row of a manually parameterised query, or null. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
