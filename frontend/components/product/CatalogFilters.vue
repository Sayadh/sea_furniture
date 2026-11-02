<script setup lang="ts">
const props = defineProps<{
  form: { minPrice: string; maxPrice: string; inStock: boolean };
  priceRange?: { min: number; max: number };
}>();
const emit = defineEmits<{ apply: [patch: { minPrice: string; maxPrice: string; inStock: boolean }]; reset: [] }>();

const local = reactive({ minPrice: props.form.minPrice, maxPrice: props.form.maxPrice, inStock: props.form.inStock });
watch(() => props.form, (f) => Object.assign(local, { minPrice: f.minPrice, maxPrice: f.maxPrice, inStock: f.inStock }), { deep: true });
const priceError = computed(() =>
  local.minPrice && local.maxPrice && Number(local.minPrice) > Number(local.maxPrice) ? 'Նվազագույն գինը չի կարող մեծ լինել առավելագույնից' : '',
);
</script>

<template>
  <form class="space-y-6" @submit.prevent="!priceError && emit('apply', { ...local })">
    <fieldset>
      <legend class="mb-3 font-serif text-lg">Գին, ֏</legend>
      <div class="grid grid-cols-2 gap-2">
        <label>
          <span class="sr-only">Նվազագույն գին</span>
          <input v-model="local.minPrice" type="number" inputmode="numeric" min="0" step="1000" class="input" :placeholder="priceRange ? `${priceRange.min}-ից` : 'Սկսած'" />
        </label>
        <label>
          <span class="sr-only">Առավելագույն գին</span>
          <input v-model="local.maxPrice" type="number" inputmode="numeric" min="0" step="1000" class="input" :placeholder="priceRange ? `${priceRange.max}-ը` : 'Մինչև'" />
        </label>
      </div>
      <p v-if="priceError" class="field-error">{{ priceError }}</p>
    </fieldset>
    <label class="flex cursor-pointer items-center gap-3 text-base">
      <input v-model="local.inStock" type="checkbox" class="h-5 w-5 rounded border-line text-espresso focus:ring-brass" />
      Միայն առկա ապրանքները
    </label>
    <div class="flex gap-2">
      <button type="submit" class="btn-primary flex-1">Կիրառել</button>
      <button type="button" class="btn-ghost" @click="emit('reset')">Մաքրել</button>
    </div>
  </form>
</template>
