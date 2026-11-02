import type { NitroFetchOptions } from 'nitropack';

const NO_RETRY = ['/auth/login', '/auth/refresh', '/auth/logout'];
let refreshing: Promise<boolean> | null = null;

/**
 * Admin API client. On 401 it tries one silent refresh (rotating the refresh cookie)
 * and replays the request; if refresh fails, the user is sent to the login page.
 */
export function useAdminApi() {
  const config = useRuntimeConfig();
  const nuxtApp = useNuxtApp();
  const base = $fetch.create({ baseURL: config.public.apiBase, credentials: 'include', retry: 0 });

  async function refresh(): Promise<boolean> {
    if (!refreshing) {
      refreshing = base('/auth/refresh', { method: 'POST' })
        .then(() => true)
        .catch(() => false)
        .finally(() => setTimeout(() => (refreshing = null), 0));
    }
    return refreshing;
  }

  async function request<T>(url: string, options: NitroFetchOptions<string> = {}): Promise<T> {
    try {
      return (await base(url, options as never)) as T;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 401 && !NO_RETRY.includes(url)) {
        if (await refresh()) return (await base(url, options as never)) as T;
        if (url !== '/auth/me') {
          await nuxtApp.runWithContext(() => {
            useAuthStore().admin = null;
            return navigateTo({ path: '/admin/login', query: { redirect: nuxtApp.$router.currentRoute.value.fullPath } });
          });
        }
      }
      throw error;
    }
  }

  return { request, refresh };
}
