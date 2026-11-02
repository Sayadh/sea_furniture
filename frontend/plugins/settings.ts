import type { SiteSettings } from '~/types/api';

/** Loads public site settings once (during SSR; the payload is reused on the client). */
export default defineNuxtPlugin(async () => {
  const settings = useSiteSettings();
  if (settings.value) return;
  try {
    settings.value = await useApi()<SiteSettings>('/settings');
  } catch {
    settings.value = null;
  }
});
