import { jsonLd } from '~/utils/jsonld';

/** Injects one or more schema.org JSON-LD blocks. Pass a getter to keep it reactive. */
export function useJsonLd(data: () => unknown | unknown[]) {
  // Unique per call: a shared key ("ld-0") made unhead dedupe blocks, so only the last one on a page survived
  const id = useId();
  useHead({
    script: computed(() => {
      const value = data();
      const list = (Array.isArray(value) ? value : [value]).filter(Boolean);
      return list.map((item, i) => ({ key: `ld-${id}-${i}`, type: 'application/ld+json', innerHTML: jsonLd(item) }));
    }),
  });
}

export function breadcrumbLd(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
