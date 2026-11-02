const REQUIRED = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED.filter((key) => !config[key]);
  if (missing.length) {
    const hint = missing.includes('DATABASE_URL') ? ' (or DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD)' : '';
    throw new Error(`Missing required environment variables: ${missing.join(', ')}${hint}`);
  }
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (String(config[key]).length < 32) {
      throw new Error(`${key} must be at least 32 characters long`);
    }
  }
  return config;
}
