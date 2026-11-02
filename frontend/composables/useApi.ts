/**
 * $fetch instance for public API calls (SSR → internal URL, browser → same-origin /api).
 *
 * Read requests (GET/HEAD) are retried: on shared hosting the API may be waking up
 * (cold start) when the first visitor arrives. Writes (POST/PATCH/…) are never
 * retried, so an order or a form can't be submitted twice.
 */
export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = import.meta.server ? (config.apiInternalBase as string) : config.public.apiBase;
  const base = $fetch.create({
    baseURL,
    credentials: 'include',
    timeout: 25_000,
    retryDelay: 2000,
    retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
  });

  return ((url: string, opts: Record<string, unknown> = {}) => {
    const method = String(opts.method ?? 'GET').toUpperCase();
    const safe = method === 'GET' || method === 'HEAD';
    return base(url, { retry: safe ? (import.meta.server ? 4 : 2) : 0, ...opts } as never);
  }) as typeof base;
}

/** Turns a failed page-level request into the right error page (404 only when the API really said 404). */
export function pageLoadError(error: unknown, notFoundMessage: string) {
  const status = (error as { statusCode?: number } | null)?.statusCode;
  return status === 404
    ? createError({ statusCode: 404, message: notFoundMessage, fatal: true })
    : createError({ statusCode: 503, message: 'Կայքը ժամանակավորապես անհասանելի է', fatal: true });
}
