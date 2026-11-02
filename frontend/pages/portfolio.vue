<script setup lang="ts">
import type { PortfolioItem } from '~/types/api';

const api = useApi();
const { data: items, status, error, refresh } = await useAsyncData('portfolio', () => api<PortfolioItem[]>('/portfolio'), { default: () => [] as PortfolioItem[] });

const filter = ref<string>('all');
const serviceTypes = computed(() => [...new Map(items.value.filter((i) => i.service).map((i) => [i.service!.slug, i.service!.title])).entries()]);
const visible = computed(() => (filter.value === 'all' ? items.value : items.value.filter((i) => i.service?.slug === filter.value)));
const img = (item: PortfolioItem, kind: 'BEFORE' | 'AFTER') => item.images.find((i) => i.kind === kind)?.url;
const gallery = (item: PortfolioItem) => item.images.filter((i) => i.kind === 'GALLERY');

useSeo({
  title: 'Մեր աշխատանքները — վերանորոգումից առաջ և հետո',
  description: 'Տեսեք, թե ինչպես ենք վերանորոգում բազմոցներ, բազկաթոռներ և աթոռներ․ իրական աշխատանքների լուսանկարներ «մինչև» և «հետո»։',
});
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Մեր աշխատանքները' }]" />
    <header class="mb-10 mt-6 max-w-2xl">
      <h1 class="text-h1">Մեր աշխատանքները</h1>
      <p class="mt-3 text-lg text-muted">Յուրաքանչյուր աշխատանքում շարժեք սլաքը և համեմատեք կահույքը վերանորոգումից առաջ և հետո։</p>
    </header>

    <div v-if="serviceTypes.length > 1" class="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Ֆիլտր ըստ ծառայության">
      <button type="button" class="badge shrink-0 px-3.5 py-2 text-sm" :class="filter === 'all' ? 'bg-espresso text-linen' : 'bg-cream text-espresso'" :aria-pressed="filter === 'all'" @click="filter = 'all'">Բոլորը</button>
      <button
        v-for="[slug, title] in serviceTypes"
        :key="slug"
        type="button"
        class="badge shrink-0 px-3.5 py-2 text-sm"
        :class="filter === slug ? 'bg-espresso text-linen' : 'bg-cream text-espresso'"
        :aria-pressed="filter === slug"
        @click="filter = slug"
      >
        {{ title }}
      </button>
    </div>

    <UiSpinner v-if="status === 'pending' && !items.length" />
    <UiErrorState v-else-if="error" @retry="refresh()" />
    <UiEmptyState v-else-if="!visible.length" icon="photo" title="Աշխատանքները շուտով կհայտնվեն" text="Մենք պատրաստում ենք մեր վերջին աշխատանքների լուսանկարները։">
      <NuxtLink to="/services" class="btn-primary">Դիտել ծառայությունները</NuxtLink>
    </UiEmptyState>
    <div v-else class="grid gap-x-8 gap-y-14 md:grid-cols-2">
      <figure v-for="(item, i) in visible" :key="item.id">
        <UiBeforeAfter v-if="img(item, 'BEFORE') && img(item, 'AFTER')" :before="img(item, 'BEFORE')!" :after="img(item, 'AFTER')!" :alt="item.title" :eager="i < 2" />
        <UiImg v-else :src="item.images[0]?.url" :alt="item.title" img-class="aspect-[4/3] w-full rounded-card object-cover" />
        <div v-if="gallery(item).length" class="mt-3 flex gap-2 overflow-x-auto">
          <UiImg v-for="g in gallery(item)" :key="g.url" :src="g.url" :alt="g.alt || item.title" sizes="120px" img-class="aspect-[4/3] w-28 shrink-0 rounded-lg object-cover" />
        </div>
        <figcaption class="mt-4">
          <p v-if="item.service" class="text-sm text-brass-dark">{{ item.service.title }}</p>
          <h2 class="mt-1 font-serif text-h2">{{ item.title }}</h2>
          <p v-if="item.description" class="mt-2 max-w-prose leading-relaxed text-muted">{{ item.description }}</p>
        </figcaption>
      </figure>
    </div>

    <section class="mt-20 flex flex-col items-start justify-between gap-6 rounded-card bg-espresso p-8 text-linen md:flex-row md:items-center md:p-12">
      <div>
        <h2 class="font-serif text-h2 text-linen">Ձեր կահույքը նույնպես կարող է նորանալ</h2>
        <p class="mt-2 text-linen/70">Ուղարկեք լուսանկարները, և մենք կասենք վերանորոգման արժեքը։</p>
      </div>
      <NuxtLink to="/services#repair-form" class="btn-brass shrink-0">Պատվիրել վերանորոգում</NuxtLink>
    </section>
  </div>
</template>
