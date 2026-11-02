<script setup lang="ts">
const props = defineProps<{ status: string; kind?: 'order' | 'request' }>();
const colors: Record<string, string> = {
  NEW: 'bg-sky-50 text-sky-800 ring-sky-200',
  CONFIRMED: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  CONTACTED: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 ring-amber-200',
  READY: 'bg-teal-50 text-teal-800 ring-teal-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  CANCELLED: 'bg-stone-100 text-stone-600 ring-stone-200',
};
const label = computed(() =>
  props.kind === 'request'
    ? requestStatusLabel[props.status as keyof typeof requestStatusLabel]
    : orderStatusLabel[props.status as keyof typeof orderStatusLabel],
);
</script>

<template>
  <span class="badge whitespace-nowrap ring-1" :class="colors[status] ?? 'bg-cream text-walnut ring-line'">{{ label ?? status }}</span>
</template>
