<script setup lang="ts">
defineProps<{ icon?: string; title: string; text?: string }>();
</script>

<template>
  <div class="flex flex-col items-center rounded-card border border-dashed border-brass/50 bg-white/60 px-6 py-14 text-center">
    <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream text-brass">
      <UiIcon :name="icon ?? 'sofa'" :size="26" />
    </span>
    <h3 class="font-serif text-lg">{{ title }}</h3>
    <p v-if="text" class="mt-2 max-w-md text-muted">{{ text }}</p>
    <div v-if="$slots.default" class="mt-6 flex flex-wrap justify-center gap-3"><slot /></div>
  </div>
</template>
