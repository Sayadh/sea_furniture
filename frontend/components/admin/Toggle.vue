<script setup lang="ts">
const model = defineModel<boolean>({ default: false });
defineProps<{ label?: string; disabled?: boolean }>();
</script>

<template>
  <label class="inline-flex cursor-pointer select-none items-center gap-3" :class="{ 'opacity-60': disabled }">
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :disabled="disabled"
      class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      :class="model ? 'bg-espresso' : 'bg-stone-300'"
      @click="model = !model"
    >
      <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" :class="model ? 'left-[22px]' : 'left-0.5'" />
    </button>
    <span v-if="label" class="text-base text-ink">{{ label }}</span>
  </label>
</template>
