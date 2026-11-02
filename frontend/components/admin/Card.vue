<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<template>
  <section class="rounded-xl border border-line bg-white">
    <header v-if="title || $slots.actions" class="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <h2 class="font-serif text-lg">{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div class="p-5"><slot /></div>
  </section>
</template>
