import type { SiteSettings } from '~/types/api';

export function useSiteSettings() {
  return useState<SiteSettings | null>('site-settings', () => null);
}
