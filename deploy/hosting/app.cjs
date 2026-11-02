/**
 * cPanel / Passenger startup file for the Nuxt (frontend) application.
 * Loads ./.env into process.env, then starts the Nitro server from .output.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}

import(pathToFileURL(path.join(__dirname, '.output/server/index.mjs')).href).catch((err) => {
  console.error('Failed to start Nuxt server:', err);
  process.exit(1);
});
