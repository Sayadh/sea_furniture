import { SITEMAP_FILES, getSitemapData, latest, sitemapUrls, xmlEscape } from '../utils/seoFeeds';
import { SEO_CONTENT_UPDATED } from '~/utils/seoContent';

/**
 * Sitemap index (submit this one URL in Google Search Console / Bing Webmaster Tools).
 * Each child sitemap covers one content type, so Search Console reports indexing per type.
 */
export default defineCachedEventHandler(
  async (event) => {
    const site = useRuntimeConfig(event).public.siteUrl;
    const data = await getSitemapData();
    const body = SITEMAP_FILES.map((file) => {
      const lastmod = latest(...sitemapUrls(file, data, SEO_CONTENT_UPDATED).map((u) => u.lastmod));
      return `<sitemap><loc>${xmlEscape(`${site}/sitemaps/${file}.xml`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</sitemap>`;
    }).join('\n');

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
  },
  { name: 'sitemap-index', maxAge: 60 * 30 },
);
