import type { H3Event } from 'h3';

/**
 * Same-origin proxy for /api and /uploads → API server.
 *
 * Only a whitelist of client headers is forwarded. Forwarding everything (Nitro's routeRules `proxy`)
 * breaks on cPanel: Passenger adds internal `!~passenger-*` request headers, and Node's HTTP parser
 * on the API rejects such header names with "400 User callback error".
 */
const FORWARDED_HEADERS = [
  'accept',
  'accept-language',
  'authorization',
  'content-type',
  'cookie',
  'if-modified-since',
  'if-none-match',
  'origin',
  'range',
  'referer',
  'user-agent',
] as const;

const PAYLOAD_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function proxyToApi(event: H3Event) {
  const { apiProxyTarget } = useRuntimeConfig(event);

  const headers: Record<string, string> = {};
  for (const name of FORWARDED_HEADERS) {
    const value = getRequestHeader(event, name);
    if (value) headers[name] = value;
  }
  // Real visitor IP for the API's rate limiting (the API trusts the proxy chain via TRUST_PROXY)
  const ip = getRequestIP(event, { xForwardedFor: true });
  if (ip) headers['x-forwarded-for'] = ip;

  const body = PAYLOAD_METHODS.has(event.method) ? await readRawBody(event, false) : undefined;

  return sendProxy(event, `${apiProxyTarget}${event.path}`, {
    fetchOptions: { method: event.method, headers, body, redirect: 'manual' },
  });
}
