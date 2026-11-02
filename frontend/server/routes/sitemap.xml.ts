interface SitemapData {
  products: { slug: string; updatedAt: string; images: { url: string }[] }[];
  categories: { slug: string; updatedAt: string }[];
  services: { slug: string; updatedAt: string }[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const site = config.public.siteUrl;
    const data = await $fetch<SitemapData>(`${config.apiInternalBase}/seo/sitemap`).catch(
      () => ({ products: [], categories: [], services: [] }) as SitemapData,
    );

    const urls: { loc: string; lastmod?: string; priority: string; image?: string }[] = [
      { loc: '/', priority: '1.0' },
      { loc: '/catalog', priority: '0.9' },
      { loc: '/services', priority: '0.9' },
      { loc: '/portfolio', priority: '0.7' },
      { loc: '/about', priority: '0.5' },
      { loc: '/contact', priority: '0.6' },
      { loc: '/faq', priority: '0.5' },
      ...data.categories.map((c) => ({ loc: `/catalog/${c.slug}`, lastmod: c.updatedAt, priority: '0.8' })),
      ...data.services.map((s) => ({ loc: `/services/${s.slug}`, lastmod: s.updatedAt, priority: '0.8' })),
      ...data.products.map((p) => ({ loc: `/products/${p.slug}`, lastmod: p.updatedAt, priority: '0.7', image: p.images[0]?.url })),
    ];

    const body = urls
      .map((u) => {
        const image = u.image ? `<image:image><image:loc>${esc(u.image.startsWith('http') ? u.image : site + u.image)}</image:loc></image:image>` : '';
        const lastmod = u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : '';
        return `<url><loc>${esc(site + u.loc)}</loc>${lastmod}<priority>${u.priority}</priority>${image}</url>`;
      })
      .join('');

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
  },
  { maxAge: 60 * 30, name: 'sitemap' },
);
