/**
 * If server-side rendering could not load some data (e.g. the API was still starting),
 * retry those requests once in the browser right after the page appears,
 * so the visitor sees content instead of an error box without pressing refresh.
 */
import type { SiteSettings } from '~/types/api';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', async () => {
    const errors = (nuxtApp.payload._errors ?? {}) as Record<string, unknown>;
    const failed = Object.keys(errors).filter((key) => errors[key]);
    if (failed.length) await refreshNuxtData(failed);

    const settings = useSiteSettings();
    if (!settings.value) {
      try {
        settings.value = await useApi()<SiteSettings>('/settings');
      } catch {
        /* still unavailable — pages show their own error state with a retry button */
      }
    }
  });
});
