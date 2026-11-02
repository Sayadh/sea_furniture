<script setup lang="ts">
import type { ProductCard } from '~/types/api';

defineProps<{ products: ProductCard[]; eagerCount?: number }>();
</script>

<template>
  <div class="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <ProductCard v-for="(p, i) in products" :key="p.id" :product="p" :eager="i < (eagerCount ?? 0)" />
  </div>
</template>
