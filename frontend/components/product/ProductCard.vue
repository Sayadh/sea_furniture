<script setup lang="ts">
import type { ProductCard } from '~/types/api';

const props = defineProps<{ product: ProductCard; eager?: boolean }>();
const cart = useCartStore();
const toast = useToast();

const discount = computed(() => {
  const { price, oldPrice } = props.product;
  return price > 0 && oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
});
const main = computed(() => props.product.images[0]);
const second = computed(() => props.product.images[1]);
const disabled = computed(() => props.product.availability === 'OUT_OF_STOCK');

function addToCart() {
  cart.add({ ...props.product, image: main.value?.url ?? null });
  toast.success(`«${props.product.name.replace(/[«»]/g, '')}» ավելացվեց զամբյուղ`);
}
</script>

<template>
  <article class="group relative flex flex-col">
    <NuxtLink :to="`/products/${product.slug}`" class="relative block overflow-hidden rounded-card bg-cream" :aria-label="product.name">
      <UiImg
        :src="main?.url"
        :alt="main?.alt || product.name"
        :eager="eager"
        sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
        :width="800"
        :height="600"
        img-class="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <UiImg
        v-if="second"
        :src="second.url"
        :alt="''"
        sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
        :width="800"
        :height="600"
        img-class="absolute inset-0 aspect-[4/3] w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
      />
      <div class="absolute left-3 top-3 flex flex-col items-start gap-1.5">
        <span v-if="discount" class="badge bg-espresso text-linen">−{{ discount }}%</span>
        <span v-if="product.isNew" class="badge bg-linen text-espresso">Նորույթ</span>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col pt-4">
      <div class="mb-1.5 flex items-center justify-between gap-2">
        <NuxtLink :to="`/catalog/${product.category.slug}`" class="text-sm text-muted hover:text-brass-dark">{{ product.category.name }}</NuxtLink>
        <UiAvailabilityBadge :value="product.availability" />
      </div>
      <h3 class="font-serif text-lg leading-snug">
        <NuxtLink :to="`/products/${product.slug}`" class="hover:text-walnut">{{ product.name }}</NuxtLink>
      </h3>
      <p v-if="product.shortDescription" class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{{ product.shortDescription }}</p>
      <div class="mt-auto pt-3">
        <UiPrice :price="product.price" :old-price="product.oldPrice" />
        <div class="mt-3 grid grid-cols-[auto_1fr] gap-2">
          <NuxtLink :to="`/products/${product.slug}`" class="btn-outline btn-sm">Դիտել</NuxtLink>
          <button type="button" class="btn-primary btn-sm" :disabled="disabled" @click="addToCart">
            <UiIcon name="cart" :size="16" />
            <span>{{ disabled ? 'Առկա չէ' : 'Ավելացնել զամբյուղ' }}</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
