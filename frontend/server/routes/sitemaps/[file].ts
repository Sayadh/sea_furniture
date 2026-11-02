import { SITEMAP_FILES, getSitemapData, sitemapUrls, urlsetXml, type SitemapFile } from '../../utils/seoFeeds';
import { SEO_CONTENT_UPDATED } from '~/utils/seoContent';

/** Child sitemaps: /sitemaps/pages.xml, categories.xml, services.xml, products.xml (with product images). */
export default defineCachedEventHandler(
  async (event) => {
    const name = String(getRouterParam(event, 'file') ?? '').replace(/\.xml$/, '');
    if (!(SITEMAP_FILES as readonly string[]).includes(name)) {
      throw createError({ statusCode: 404, statusMessage: 'Sitemap not found' });
    }
    const site = useRuntimeConfig(event).public.siteUrl;
    const urls = sitemapUrls(name as SitemapFile, await getSitemapData(), SEO_CONTENT_UPDATED);
    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    return urlsetXml(site, urls);
  },
  { name: 'sitemap-file', maxAge: 60 * 30, getKey: (event) => String(getRouterParam(event, 'file')) },
);
