<script setup lang="ts">
import { breadcrumbLd } from '~/composables/useJsonLd';

const props = defineProps<{ items: { name: string; path?: string }[] }>();
const config = useRuntimeConfig();
const route = useRoute();
const all = computed(() => [{ name: 'Գլխավոր', path: '/' }, ...props.items]);

useJsonLd(() =>
  breadcrumbLd(
    config.public.siteUrl,
    all.value.map((i) => ({ name: i.name, path: i.path ?? route.path })),
  ),
);
</script>

<template>
  <nav aria-label="Breadcrumb" class="text-sm text-muted">
    <ol class="flex flex-wrap items-center gap-1.5">
      <li v-for="(item, i) in all" :key="i" class="flex items-center gap-1.5">
        <NuxtLink v-if="item.path && i < all.length - 1" :to="item.path" class="hover:text-espresso">{{ item.name }}</NuxtLink>
        <span v-else aria-current="page" class="text-walnut">{{ item.name }}</span>
        <UiIcon v-if="i < all.length - 1" name="chevron-right" :size="14" class="text-brass" />
      </li>
    </ol>
  </nav>
</template>
