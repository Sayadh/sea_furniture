<script setup lang="ts">
/** Buying guide — targets informational searches («լավ / որակյալ կահույք», «ինչպես ընտրել բազմոց»). */
const config = useRuntimeConfig();
const PUBLISHED = SEO_CONTENT_UPDATED;
const IMAGE = '/images/home-repair-1440.webp';

useSeo({
  title: 'Ինչպես ընտրել լավ բազմոց և փափուկ կահույք',
  description:
    'Ինչպես ընտրել որակյալ փափուկ կահույք․ կարկաս, սպունգ, կտոր, մեխանիզմ, չափսեր և խնամք։ Վարպետների խորհուրդներ 3 տարվա փորձով՝ Sea Furniture, Երևան։',
  image: IMAGE,
  type: 'article',
});
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: guideSeo.title,
  description: guideSeo.intro[0],
  image: `${config.public.siteUrl}${IMAGE}`,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  inLanguage: 'hy',
  mainEntityOfPage: `${config.public.siteUrl}/inchpes-yntrel-papuk-kahuyq`,
  author: { '@type': 'Organization', name: config.public.siteName, url: config.public.siteUrl },
  publisher: { '@type': 'Organization', name: config.public.siteName, logo: { '@type': 'ImageObject', url: `${config.public.siteUrl}/logo.png` } },
}));
</script>

<template>
  <div>
    <article class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Ինչպես ընտրել կահույք' }]" />
      <header class="mt-6 max-w-3xl">
        <h1 class="text-h1">{{ guideSeo.title }}</h1>
        <p v-for="(p, i) in guideSeo.intro" :key="i" class="mt-4 text-lg leading-relaxed text-muted">{{ p }}</p>
      </header>

      <img
        :src="IMAGE"
        srcset="/images/home-repair-800.webp 800w, /images/home-repair-1440.webp 1440w"
        sizes="(min-width: 1024px) 768px, 100vw"
        alt="Բաց երանգի որակյալ փափուկ անկյունային բազմոց լուսավոր հյուրասենյակում"
        width="1440"
        height="1086"
        class="mt-10 aspect-[16/9] w-full max-w-3xl rounded-card object-cover"
      />

      <ol class="mt-12 max-w-3xl space-y-10">
        <li v-for="(s, i) in guideSeo.sections" :key="s.h" class="grid grid-cols-[auto_1fr] gap-4 sm:gap-6">
          <span class="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-brass ring-1 ring-brass/40" aria-hidden="true">{{ i + 1 }}</span>
          <div>
            <h2 class="font-serif text-h2 text-espresso">{{ s.h }}</h2>
            <p v-for="(p, j) in s.p" :key="j" class="mt-3 text-base leading-relaxed text-ink/80">{{ p }}</p>
          </div>
        </li>
      </ol>

      <aside class="mt-14 max-w-3xl rounded-card bg-espresso p-6 text-linen sm:p-8">
        <p class="font-serif text-h2">Չե՞ք գտնում ճիշտ չափը կամ կտորը</p>
        <p class="mt-2 text-base text-linen/75">Կպատրաստենք կահույք ձեր չափսերով և ընտրած կտորով, իսկ մեր մասնագետը կօգնի ընտրությունում։</p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <NuxtLink to="/catalog/patverov-kahuyq" class="btn-brass px-7">Պատվերով կահույք</NuxtLink>
          <NuxtLink to="/catalog" class="btn-light px-7">Դիտել կատալոգը</NuxtLink>
        </div>
      </aside>
    </article>

    <section class="section border-t border-line">
      <div class="container">
        <SeoContentBlock :content="{ title: 'Ձեզ կարող է հետաքրքրել', intro: [], sections: [], faqs: guideSeo.faqs, links: guideSeo.links }" />
      </div>
    </section>
  </div>
</template>
