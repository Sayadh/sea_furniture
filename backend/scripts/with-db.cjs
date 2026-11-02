#!/usr/bin/env node
/**
 * Runs a command with DATABASE_URL prepared from .env / DB_* variables
 * (same logic as the running app). Requires a built backend (dist/).
 *
 *   node scripts/with-db.cjs prisma migrate deploy
 *   node scripts/with-db.cjs node dist-seed/seed.js
 */
const { spawnSync } = require('child_process');
const path = require('path');

require(path.join(__dirname, '..', 'dist', 'config', 'bootstrap-env.js'));

if (!process.env.DATABASE_URL) {
  console.error('✗ Database is not configured. Set DB_DATABASE, DB_USERNAME, DB_PASSWORD (and DB_HOST, DB_PORT) or DATABASE_URL.');
  process.exit(1);
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('Usage: node scripts/with-db.cjs <command> [...args]');
  process.exit(1);
}
const bin = cmd === 'prisma' ? path.join(__dirname, '..', 'node_modules', '.bin', 'prisma') : cmd;
const result = spawnSync(bin, args, { stdio: 'inherit', env: process.env, cwd: path.join(__dirname, '..') });
process.exit(result.status ?? 1);
