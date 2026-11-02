/**
 * Data + helpers for /sitemap.xml, /sitemaps/*.xml, /llms.txt and /llms-full.txt.
 * Data comes from the API (public, read-only) and is cached for 30 minutes.
 */

export interface SitemapData {
  products: { slug: string; updatedAt: string; images: { url: string }[] }[];
  categories: { slug: string; updatedAt: string }[];
  services: { slug: string; updatedAt: string }[];
  portfolioUpdatedAt: string | null;
  faqUpdatedAt: string | null;
  settingsUpdatedAt: string | null;
}

export interface LlmsData {
  settings: {
    siteName: string;
    phone: string | null;
    phone2: string | null;
    whatsapp: string | null;
    address: string | null;
    workingHours: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    facebookUrl: string | null;
    deliveryInfo: string | null;
    seoDescription: string | null;
  } | null;
  categories: { name: string; slug: string; description: string | null }[];
  services: { title: string; slug: string; shortDescription: string | null; duration: string | null }[];
  products: {
    name: string;
    slug: string;
    shortDescription: string | null;
    material: string | null;
    availability: 'IN_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
    category: { name: string };
  }[];
  faqs: { question: string; answer: string }[];
}

// The API may be cold-starting on shared hosting: retry, and if it is still down answer 503 instead of
// caching an empty sitemap (crawlers retry a 503 later; failures are never cached).
const FETCH_OPTS = { retry: 3, retryDelay: 2000, timeout: 25_000 } as const;
function unavailable(cause: unknown): never {
  throw createError({ statusCode: 503, statusMessage: 'Temporarily unavailable', cause });
}

export const getSitemapData = defineCachedFunction(
  async (): Promise<SitemapData> => {
    const { apiInternalBase } = useRuntimeConfig();
    return $fetch<SitemapData>(`${apiInternalBase}/seo/sitemap`, FETCH_OPTS).catch(unavailable);
  },
  { name: 'seo-sitemap-data', maxAge: 60 * 30, getKey: () => 'all' },
);

export const getLlmsData = defineCachedFunction(
  async (): Promise<LlmsData> => {
    const { apiInternalBase } = useRuntimeConfig();
    return $fetch<LlmsData>(`${apiInternalBase}/seo/llms`, FETCH_OPTS).catch(unavailable);
  },
  { name: 'seo-llms-data', maxAge: 60 * 30, getKey: () => 'all' },
);

// ─────────────── XML helpers ───────────────

export const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** W3C date (what sitemaps expect); undefined for missing/invalid input. */
export function w3cDate(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Latest of several dates (ignores empty values). */
export function latest(...values: (string | Date | null | undefined)[]): string | undefined {
  const times = values.map((v) => (v ? new Date(v).getTime() : NaN)).filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)).toISOString() : undefined;
}

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  images?: string[];
}

export function urlsetXml(site: string, urls: SitemapUrl[]): string {
  const abs = (u: string) => (u.startsWith('http') ? u : `${site}${u}`);
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '';
      const images = (u.images ?? []).map((src) => `<image:image><image:loc>${xmlEscape(abs(src))}</image:loc></image:image>`).join('');
      return `<url><loc>${xmlEscape(abs(u.loc))}</loc>${lastmod}${images}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

/** Child sitemaps listed in /sitemap.xml. Keep in sync with server/routes/sitemaps/[file].ts. */
export const SITEMAP_FILES = ['pages', 'categories', 'services', 'products'] as const;
export type SitemapFile = (typeof SITEMAP_FILES)[number];

/** Static, indexable pages (cart/checkout/admin are excluded on purpose). */
export function sitemapUrls(file: SitemapFile, data: SitemapData, seoContentUpdated: string): SitemapUrl[] {
  const productsUpdated = latest(...data.products.map((p) => p.updatedAt));
  const categoriesUpdated = latest(...data.categories.map((c) => c.updatedAt));
  const servicesUpdated = latest(...data.services.map((s) => s.updatedAt));
  switch (file) {
    case 'pages':
      return [
        { loc: '/', lastmod: latest(productsUpdated, categoriesUpdated, servicesUpdated, data.faqUpdatedAt, data.settingsUpdatedAt, seoContentUpdated) },
        { loc: '/catalog', lastmod: latest(productsUpdated, categoriesUpdated, seoContentUpdated) },
        { loc: '/services', lastmod: latest(servicesUpdated, seoContentUpdated) },
        { loc: '/portfolio', lastmod: w3cDate(data.portfolioUpdatedAt) },
        { loc: '/faq', lastmod: w3cDate(data.faqUpdatedAt) },
        { loc: '/about', lastmod: w3cDate(data.settingsUpdatedAt) },
        { loc: '/contact', lastmod: w3cDate(data.settingsUpdatedAt) },
        { loc: '/kahuyq-hayastanum', lastmod: latest(productsUpdated, seoContentUpdated) },
        { loc: '/inchpes-yntrel-papuk-kahuyq', lastmod: w3cDate(seoContentUpdated) },
      ];
    case 'categories':
      return data.categories.map((c) => ({ loc: `/catalog/${c.slug}`, lastmod: latest(c.updatedAt, seoContentUpdated) }));
    case 'services':
      return data.services.map((s) => ({ loc: `/services/${s.slug}`, lastmod: w3cDate(s.updatedAt) }));
    case 'products':
      return data.products.map((p) => ({ loc: `/products/${p.slug}`, lastmod: w3cDate(p.updatedAt), images: p.images.map((i) => i.url) }));
  }
}

// ─────────────── llms.txt helpers ───────────────

/** +37494844474 → +374 94 844 474 */
export function prettyPhone(phone: string): string {
  const m = phone.replace(/\s+/g, '').match(/^\+374(\d{2})(\d{3})(\d{3})$/);
  return m ? `+374 ${m[1]} ${m[2]} ${m[3]}` : phone;
}
