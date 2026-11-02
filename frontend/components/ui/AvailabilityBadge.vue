<script setup lang="ts">
import type { Availability } from '~/types/api';

defineProps<{ value: Availability }>();
const styles: Record<Availability, string> = {
  IN_STOCK: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  MADE_TO_ORDER: 'bg-brass-light/50 text-walnut ring-1 ring-brass/30',
  OUT_OF_STOCK: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
};
</script>

<template>
  <span class="badge" :class="styles[value]">
    <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />{{ availabilityLabel[value] }}
  </span>
</template>
