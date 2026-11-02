<script setup lang="ts">
import type { Faq } from '~/types/api';

defineProps<{ items: Faq[] }>();
</script>

<template>
  <div class="divide-y divide-line border-y border-line">
    <details v-for="f in items" :key="f.id" class="group py-1">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left [&::-webkit-details-marker]:hidden">
        <span class="font-serif text-lg text-espresso">{{ f.question }}</span>
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-brass transition group-open:rotate-45 group-open:bg-espresso group-open:text-linen">
          <UiIcon name="plus" :size="16" />
        </span>
      </summary>
      <p class="max-w-prose pb-5 pr-12 leading-relaxed text-ink/80 whitespace-pre-line">{{ f.answer }}</p>
    </details>
  </div>
</template>
