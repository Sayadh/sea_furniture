/** schema.org FurnitureStore (LocalBusiness) built from admin-editable settings. */
export function useLocalBusinessLd() {
  const settings = useSiteSettings();
  const config = useRuntimeConfig();
  useJsonLd(() => {
    const s = settings.value;
    return {
      '@context': 'https://schema.org',
      '@type': 'FurnitureStore',
      name: s?.siteName || config.public.siteName,
      url: config.public.siteUrl,
      image: s?.heroImageUrl || undefined,
      // Admin-uploaded logo wins; otherwise the bundled brand logo (Google needs an absolute, crawlable URL)
      logo: s?.logoUrl || `${config.public.siteUrl}/logo.png`,
      telephone: s?.phone || undefined,
      description: s?.seoDescription || undefined,
      address: s?.address ? { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Երևան', addressCountry: 'AM' } : undefined,
      areaServed: 'AM',
      priceRange: '֏֏',
      sameAs: [s?.instagramUrl, s?.tiktokUrl, s?.facebookUrl].filter(Boolean),
      openingHours: undefined,
    };
  });
}
