<script setup lang="ts">
import type { Service } from '~/types/api';

const api = useApi();
const route = useRoute();
const config = useRuntimeConfig();
const { data: services, error, refresh } = await useAsyncData('services', () => api<Service[]>('/services'), { default: () => [] as Service[] });
const preselect = ref(typeof route.query.service === 'string' ? route.query.service : '');

function order(id: string) {
  preselect.value = id;
  document.getElementById('repair-form')?.scrollIntoView({ behavior: 'smooth' });
}

useSeo({
  title: 'Կահույքի վերանորոգում Երևանում — ծառայություններ',
  description: 'Փափուկ կահույքի վերանորոգում Երևանում․ բազմոցի վերանորոգում, աթոռների վերանորոգում, վերապաստառում, սպունգի և կարկասի փոխարինում։ Անվճար գնահատում։',
});
useJsonLd(() =>
  services.value.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.shortDescription || undefined,
    url: `${config.public.siteUrl}/services/${s.slug}`,
    areaServed: { '@type': 'City', name: 'Երևան' },
    provider: { '@type': 'FurnitureStore', name: config.public.siteName },
    ...(s.priceFrom ? { offers: { '@type': 'Offer', priceCurrency: 'AMD', price: s.priceFrom } } : {}),
  })),
);
</script>

<template>
  <div>
    <section class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Ծառայություններ' }]" />
      <header class="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <h1 class="text-h1">Փափուկ կահույքի վերանորոգում և վերականգնում</h1>
        <p class="text-lg text-muted">Վերադարձնում ենք կահույքին նախկին հարմարավետությունն ու տեսքը։ Գնահատումն անվճար է, իսկ կահույքը կարող ենք վերցնել ձեր հասցեից։</p>
      </header>
    </section>

    <section class="container pb-16">
      <UiErrorState v-if="error" @retry="refresh()" />
      <UiEmptyState v-else-if="!services.length" icon="wrench" title="Ծառայությունները շուտով կհայտնվեն" text="Մինչ այդ զանգահարեք մեզ՝ վերանորոգման մասին խորհրդատվության համար։" />
      <div v-else class="space-y-6">
        <article
          v-for="(s, i) in services"
          :id="s.slug"
          :key="s.id"
          class="grid scroll-mt-24 overflow-hidden rounded-card border border-line bg-white md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        >
          <NuxtLink :to="`/services/${s.slug}`" class="block bg-cream" :class="{ 'md:order-2': i % 2 }">
            <UiImg :src="s.images[0]?.url" :alt="s.images[0]?.alt || s.title" sizes="(min-width: 768px) 40vw, 100vw" img-class="aspect-[4/3] h-full w-full object-cover" />
          </NuxtLink>
          <div class="flex flex-col p-6 md:p-10">
            <h2 class="font-serif text-h2"><NuxtLink :to="`/services/${s.slug}`" class="hover:text-walnut">{{ s.title }}</NuxtLink></h2>
            <p v-if="s.shortDescription" class="mt-3 text-lg leading-relaxed text-ink/80">{{ s.shortDescription }}</p>
            <dl class="mt-6 grid grid-cols-2 gap-4 border-y border-line py-4 text-base">
              <div>
                <dt class="text-muted">Գինը</dt>
                <dd class="mt-0.5 font-medium text-espresso">{{ s.priceFrom ? `${formatPrice(s.priceFrom)}-ից` : 'Գնահատումից հետո' }}</dd>
              </div>
              <div v-if="s.duration">
                <dt class="text-muted">Ժամկետը</dt>
                <dd class="mt-0.5 font-medium text-espresso">{{ s.duration }}</dd>
              </div>
            </dl>
            <div class="mt-auto flex flex-wrap gap-3 pt-6">
              <button type="button" class="btn-primary" @click="order(s.id)">Պատվիրել</button>
              <NuxtLink :to="`/services/${s.slug}`" class="btn-ghost">Մանրամասն</NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section id="repair-form" class="scroll-mt-20 bg-cream py-16 md:py-24">
      <div class="container grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <h2 class="section-title">Պատվիրել վերանորոգում</h2>
          <p class="mt-4 max-w-md text-lg leading-relaxed text-ink/80">Լրացրեք ձևը և կցեք կահույքի մի քանի լուսանկար։ Վարպետը կուսումնասիրի դրանք և կզանգահարի ձեզ նույն կամ հաջորդ աշխատանքային օրը։</p>
          <div class="stitch mt-8 w-24" aria-hidden="true" />
          <ul class="mt-8 space-y-3 text-base text-ink/80">
            <li class="flex gap-3"><UiIcon name="check" class="mt-0.5 shrink-0 text-brass" />Անվճար գնահատում լուսանկարներով</li>
            <li class="flex gap-3"><UiIcon name="check" class="mt-0.5 shrink-0 text-brass" />Կտորների նմուշներ՝ ձեր տանը</li>
            <li class="flex gap-3"><UiIcon name="check" class="mt-0.5 shrink-0 text-brass" />Աշխատանքի երաշխիք</li>
          </ul>
        </div>
        <div class="rounded-card bg-linen p-5 shadow-soft sm:p-8">
          <FormsRepairRequestForm :services="services" :preselect="preselect" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SeoContentBlock :content="servicesSeo" />
      </div>
    </section>
  </div>
</template>
