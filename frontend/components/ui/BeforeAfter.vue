<script setup lang="ts">
/** Draggable before/after comparison. Keyboard accessible through a native range input. */
const props = defineProps<{ before: string; after: string; alt: string; eager?: boolean }>();
const pos = ref(50);
void props;
</script>

<template>
  <div class="relative select-none overflow-hidden rounded-card bg-cream">
    <UiImg :src="after" :alt="`${alt} — հետո`" :eager="eager" sizes="(min-width: 1024px) 50vw, 100vw" img-class="aspect-[4/3] w-full object-cover" />
    <div class="absolute inset-0" :style="{ clipPath: `inset(0 ${100 - pos}% 0 0)` }">
      <UiImg :src="before" :alt="`${alt} — մինչև`" :eager="eager" sizes="(min-width: 1024px) 50vw, 100vw" img-class="aspect-[4/3] h-full w-full object-cover" />
    </div>
    <div class="pointer-events-none absolute inset-y-0 w-0" :style="{ left: `${pos}%` }" aria-hidden="true">
      <div class="absolute inset-y-0 -left-px w-0.5 bg-linen/90" />
      <div class="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-brass bg-linen text-espresso shadow-lift">
        <UiIcon name="chevron-left" :size="14" /><UiIcon name="chevron-right" :size="14" />
      </div>
    </div>
    <span class="absolute left-3 top-3 rounded-full bg-espresso/75 px-3 py-1 text-sm text-linen">Մինչև</span>
    <span class="absolute right-3 top-3 rounded-full bg-linen/90 px-3 py-1 text-sm text-espresso">Հետո</span>
    <input
      v-model.number="pos"
      type="range"
      min="0"
      max="100"
      step="1"
      class="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      :aria-label="`${alt}․ համեմատել «մինչև» և «հետո» նկարները`"
    />
  </div>
</template>
