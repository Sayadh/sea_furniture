/** Paths that are never useful in search results (repeated in every group: a bot follows only its own group). */
const DISALLOW = ['/admin', '/api/', '/cart', '/checkout', '/order-success'];

/** AI assistants and AI search crawlers — explicitly welcome; a short business summary for them is at /llms.txt. */
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'Meta-ExternalAgent', 'Amazonbot', 'CCBot',
];

export default defineEventHandler((event) => {
  const { public: pub } = useRuntimeConfig(event);
  const rules = ['Allow: /', ...DISALLOW.map((p) => `Disallow: ${p}`)];
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return [
    'User-agent: *',
    ...rules,
    '',
    '# AI assistants and AI search — welcome. Business summary: /llms.txt (full: /llms-full.txt)',
    ...AI_BOTS.map((b) => `User-agent: ${b}`),
    ...rules,
    '',
    `Sitemap: ${pub.siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
});
