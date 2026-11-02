<script setup lang="ts">
import type { Category } from '~/types/api';

const route = useRoute();
const api = useApi();
const slug = computed(() => String(route.params.slug));

const { data: category, error } = await useAsyncData(`category:${slug.value}`, () => api<Category>(`/categories/${slug.value}`));
if (error.value || !category.value) {
  throw pageLoadError(error.value, 'Բաժինը չի գտնվել');
}

useSeo(() => ({
  title: category.value?.seoTitle || category.value?.name,
  description: category.value?.seoDescription || category.value?.description,
  image: category.value?.imageUrl,
}));
</script>

<template>
  <div v-if="category" class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Կատալոգ', path: '/catalog' }, { name: category.name }]" />
    <header class="mb-10 mt-6 max-w-2xl">
      <h1 class="text-h1">{{ category.name }}</h1>
      <p v-if="category.description" class="mt-3 text-lg text-muted">{{ category.description }}</p>
    </header>
    <ProductCatalogView :category="category" />
  </div>
</template>
