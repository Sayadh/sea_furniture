<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; back?: string }>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <NuxtLink v-if="back" :to="back" class="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-espresso"><UiIcon name="arrow-left" :size="15" />Հետ</NuxtLink>
      <h1 class="font-serif text-h2">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap gap-2"><slot /></div>
  </div>
</template>
