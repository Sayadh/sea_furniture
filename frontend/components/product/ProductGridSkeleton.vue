<script setup lang="ts">
defineProps<{ count?: number }>();
</script>

<template>
  <div class="grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Բեռնվում է">
    <div v-for="i in count ?? 8" :key="i" class="animate-pulse">
      <div class="aspect-[4/3] rounded-card bg-cream" />
      <div class="mt-4 h-3 w-1/3 rounded bg-cream" />
      <div class="mt-3 h-5 w-3/4 rounded bg-cream" />
      <div class="mt-3 h-4 w-1/2 rounded bg-cream" />
    </div>
  </div>
</template>
