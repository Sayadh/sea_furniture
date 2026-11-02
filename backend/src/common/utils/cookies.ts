import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

export const ACCESS_COOKIE = 'sf_access';
export const REFRESH_COOKIE = 'sf_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';

export function baseCookieOptions(config: ConfigService): CookieOptions {
  return {
    httpOnly: true,
    secure: config.get<string>('COOKIE_SECURE', 'true') === 'true',
    sameSite: 'lax',
    domain: config.get<string>('COOKIE_DOMAIN') || undefined,
  };
}
