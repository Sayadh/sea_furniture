interface SeoInput {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

/** Title, description, canonical URL and Open Graph / Twitter tags for a page. */
export function useSeo(input: SeoInput | (() => SeoInput)) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const settings = useSiteSettings();
  const resolve = () => (typeof input === 'function' ? input() : input);

  const siteName = computed(() => settings.value?.siteName || config.public.siteName);
  const absolute = (url?: string | null) => {
    if (!url) return undefined;
    return url.startsWith('http') ? url : `${config.public.siteUrl}${url}`;
  };
  const canonical = computed(() => `${config.public.siteUrl}${route.path === '/' ? '' : route.path.replace(/\/$/, '')}`);
  const title = computed(() => {
    const t = resolve().title;
    return t ? `${t} | ${siteName.value}` : settings.value?.seoTitle || siteName.value;
  });
  const description = computed(() => resolve().description || settings.value?.seoDescription || undefined);
  const image = computed(() => absolute(resolve().image || settings.value?.heroImageUrl));

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: () => (resolve().type === 'article' ? 'article' : 'website'),
    ogUrl: canonical,
    ogImage: image,
    ogSiteName: siteName,
    ogLocale: 'hy_AM',
    twitterCard: 'summary_large_image',
    robots: () => (resolve().noindex ? 'noindex, nofollow' : 'index, follow'),
  });
  useHead({ link: [{ rel: 'canonical', href: canonical }] });
}
