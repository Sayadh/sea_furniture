export default defineEventHandler((event) => {
  const { public: pub } = useRuntimeConfig(event);
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /order-success',
    '',
    `Sitemap: ${pub.siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
});
