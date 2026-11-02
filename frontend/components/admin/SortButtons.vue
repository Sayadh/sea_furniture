<script setup lang="ts">
defineProps<{ first: boolean; last: boolean; disabled?: boolean }>();
const emit = defineEmits<{ move: [dir: -1 | 1] }>();
</script>

<template>
  <div class="inline-flex flex-col">
    <button type="button" class="rounded p-0.5 text-muted hover:bg-cream hover:text-espresso disabled:opacity-25" :disabled="first || disabled" aria-label="Բարձրացնել" @click="emit('move', -1)">
      <UiIcon name="chevron-up" :size="16" />
    </button>
    <button type="button" class="rounded p-0.5 text-muted hover:bg-cream hover:text-espresso disabled:opacity-25" :disabled="last || disabled" aria-label="Իջեցնել" @click="emit('move', 1)">
      <UiIcon name="chevron-down" :size="16" />
    </button>
  </div>
</template>
