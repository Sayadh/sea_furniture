<script setup lang="ts">
const model = defineModel<number>({ required: true });
withDefaults(defineProps<{ min?: number; max?: number; small?: boolean }>(), { min: 1, max: 99 });
</script>

<template>
  <div class="inline-flex items-center rounded-md border border-line bg-white" :class="small ? 'h-9' : 'h-[46px]'">
    <button type="button" class="flex h-full w-10 items-center justify-center text-espresso hover:bg-cream disabled:opacity-40" :disabled="model <= min" aria-label="Պակասեցնել" @click="model = Math.max(min, model - 1)">
      <UiIcon name="minus" :size="16" />
    </button>
    <input
      :value="model"
      type="number"
      inputmode="numeric"
      :min="min"
      :max="max"
      class="h-full w-12 border-0 bg-transparent text-center text-base font-medium [appearance:textfield] focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none"
      aria-label="Քանակ"
      @change="model = Math.min(max, Math.max(min, Number(($event.target as HTMLInputElement).value) || min))"
    />
    <button type="button" class="flex h-full w-10 items-center justify-center text-espresso hover:bg-cream disabled:opacity-40" :disabled="model >= max" aria-label="Ավելացնել" @click="model = Math.min(max, model + 1)">
      <UiIcon name="plus" :size="16" />
    </button>
  </div>
</template>
