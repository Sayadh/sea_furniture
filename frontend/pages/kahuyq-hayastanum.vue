<script setup lang="ts">
import type { ProductList } from '~/types/api';

/** Armenia-wide landing: one page for all regions (not thin per-city pages, which search engines treat as doorways). */
const api = useApi();
const settings = useSiteSettings();
const { data: products } = await useAsyncData('armenia:products', () =>
  api<ProductList>('/products', { query: { featured: 'true', limit: 4 } }),
);

useSeo({
  title: 'Կահույք Հայաստանում՝ առաքում բոլոր մարզեր',
  description:
    'Փափուկ կահույք Երևանից՝ առաքումով Հայաստանի բոլոր մարզեր․ Գյումրի, Վանաձոր, Աբովյան, Էջմիածին, Հրազդան և այլ քաղաքներ։ Բազմոցներ, բազկաթոռներ և պատվերով կահույք։',
});
useLocalBusinessLd();
</script>

<template>
  <div>
    <section class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Առաքում Հայաստանում' }]" />
      <header class="mt-6 max-w-3xl">
        <h1 class="text-h1">{{ armeniaSeo.title }}</h1>
        <p v-for="(p, i) in armeniaSeo.intro" :key="i" class="mt-4 text-lg leading-relaxed text-muted">{{ p }}</p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <NuxtLink to="/catalog" class="btn-primary px-7">Դիտել կատալոգը</NuxtLink>
          <a
            v-if="settings?.whatsapp"
            :href="whatsappLink(settings.whatsapp, 'Բարև Ձեզ, ուզում եմ պատվիրել կահույք առաքումով մարզ')"
            target="_blank"
            rel="noopener"
            class="btn-outline px-7"
          >
            <UiIcon name="whatsapp" :size="18" />Գրել WhatsApp-ով
          </a>
        </div>
      </header>
    </section>

    <section class="bg-cream py-14 md:py-20">
      <div class="container grid gap-10 lg:grid-cols-2">
        <div>
          <h2 class="section-title">Առաքում ենք բոլոր մարզեր</h2>
          <ul class="mt-6 flex flex-wrap gap-2" aria-label="Մարզեր">
            <li v-for="r in ARMENIA_MARZER" :key="r" class="rounded-full bg-linen px-3.5 py-1.5 text-sm text-espresso shadow-soft">{{ r }}</li>
          </ul>
        </div>
        <div>
          <h2 class="section-title">Քաղաքներ</h2>
          <p class="mt-6 text-base leading-relaxed text-ink/80">
            Առաքում ենք {{ ARMENIAN_CITIES.join(', ') }} և Հայաստանի մյուս բնակավայրեր։
          </p>
        </div>
      </div>
    </section>

    <section v-if="products?.items.length" class="section">
      <div class="container">
        <div class="mb-8 flex items-end justify-between gap-4">
          <h2 class="section-title">Առաջարկվող կահույք</h2>
          <NuxtLink to="/catalog" class="text-base font-medium text-walnut underline-offset-4 hover:underline">Ամբողջ կատալոգը</NuxtLink>
        </div>
        <ProductGrid :products="products.items" />
      </div>
    </section>

    <section class="section border-t border-line">
      <div class="container">
        <SeoContentBlock :content="{ ...armeniaSeo, title: 'Ինչպես է կատարվում առաքումը', intro: [] }" />
      </div>
    </section>
  </div>
</template>
