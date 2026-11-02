/**
 * Loaded before anything else (first import in main.ts, and by scripts/with-db.cjs).
 *
 * 1. Loads .env from the app root without overriding variables that are already set
 *    (cPanel "Environment variables" always win over the file).
 * 2. If DATABASE_URL is not set, builds it from DB_HOST / DB_PORT / DB_DATABASE /
 *    DB_USERNAME / DB_PASSWORD. Credentials are URL-encoded, so passwords with
 *    special characters (@ # / : ? %) work as-is.
 */
import { config as loadDotenv } from 'dotenv';
import { join } from 'path';

loadDotenv({ path: join(process.cwd(), '.env') });

export function buildDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = env;
  if (!DB_DATABASE || !DB_USERNAME || DB_PASSWORD === undefined) return undefined;
  const user = encodeURIComponent(DB_USERNAME);
  const pass = encodeURIComponent(DB_PASSWORD);
  const host = DB_HOST || 'localhost';
  const port = DB_PORT || '3306';
  return `mysql://${user}:${pass}@${host}:${port}/${encodeURIComponent(DB_DATABASE)}`;
}

const url = buildDatabaseUrl();
if (url) process.env.DATABASE_URL = url;
