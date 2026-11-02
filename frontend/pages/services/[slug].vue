<script setup lang="ts">
import type { Service } from '~/types/api';

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();
const settings = useSiteSettings();
const slug = String(route.params.slug);

const { data: service, error } = await useAsyncData(`service:${slug}`, () => api<Service>(`/services/${slug}`));
if (error.value || !service.value) throw pageLoadError(error.value, 'Ծառայությունը չի գտնվել');
const { data: services } = await useAsyncData('services', () => api<Service[]>('/services'), { default: () => [] as Service[] });

const s = computed(() => service.value!);
const others = computed(() => services.value.filter((x) => x.id !== s.value.id).slice(0, 3));

useSeo(() => ({ title: s.value.seoTitle || s.value.title, description: s.value.seoDescription || s.value.shortDescription, image: s.value.images[0]?.url }));
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.value.title,
  description: s.value.shortDescription || undefined,
  image: s.value.images[0]?.url,
  areaServed: { '@type': 'City', name: 'Երևան' },
  provider: { '@type': 'FurnitureStore', name: settings.value?.siteName || config.public.siteName, telephone: settings.value?.phone || undefined },
  ...(s.value.priceFrom ? { offers: { '@type': 'Offer', priceCurrency: 'AMD', price: s.value.priceFrom } } : {}),
}));
</script>

<template>
  <div v-if="service">
    <div class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Ծառայություններ', path: '/services' }, { name: s.title }]" />
      <div class="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <UiImg :src="s.images[0]?.url" :alt="s.images[0]?.alt || s.title" eager sizes="(min-width: 1024px) 50vw, 100vw" img-class="aspect-[4/3] w-full rounded-card object-cover" />
        <div>
          <h1 class="text-h1">{{ s.title }}</h1>
          <p v-if="s.shortDescription" class="mt-4 text-lg leading-relaxed text-muted">{{ s.shortDescription }}</p>
          <dl class="mt-8 grid grid-cols-2 gap-4 border-y border-line py-5">
            <div><dt class="text-sm text-muted">Գինը</dt><dd class="mt-1 font-serif text-h2 text-espresso">{{ s.priceFrom ? `${formatPrice(s.priceFrom)}-ից` : 'Գնահատումից հետո' }}</dd></div>
            <div v-if="s.duration"><dt class="text-sm text-muted">Մոտավոր ժամկետը</dt><dd class="mt-1 font-serif text-h2 text-espresso">{{ s.duration }}</dd></div>
          </dl>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink :to="{ path: '/services', query: { service: s.id }, hash: '#repair-form' }" class="btn-primary">Պատվիրել ծառայությունը</NuxtLink>
            <a :href="whatsappLink(settings?.whatsapp, `Բարև Ձեզ, հետաքրքրված եմ «${s.title}» ծառայությամբ։`)" target="_blank" rel="noopener" class="btn-outline"><UiIcon name="whatsapp" :size="18" />Ուղարկել նկարներ WhatsApp-ով</a>
          </div>
        </div>
      </div>
      <section v-if="s.description" class="mt-16 max-w-3xl">
        <h2 class="section-title">Ինչ է ներառում աշխատանքը</h2>
        <div class="stitch mt-4 w-24" aria-hidden="true" />
        <p class="prose-text mt-6">{{ s.description }}</p>
      </section>
    </div>
    <section v-if="others.length" class="border-t border-line bg-cream/50 py-16">
      <div class="container">
        <h2 class="section-title mb-8">Այլ ծառայություններ</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <NuxtLink v-for="o in others" :key="o.id" :to="`/services/${o.slug}`" class="group">
            <UiImg :src="o.images[0]?.url" :alt="o.title" sizes="(min-width: 768px) 33vw, 100vw" img-class="aspect-[4/3] w-full rounded-card object-cover" />
            <h3 class="mt-4 font-serif text-lg group-hover:text-walnut">{{ o.title }}</h3>
            <p class="mt-1 text-sm text-muted">{{ o.priceFrom ? `${formatPrice(o.priceFrom)}-ից` : 'Գինը՝ գնահատումից հետո' }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
