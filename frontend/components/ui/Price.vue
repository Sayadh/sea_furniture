<script setup lang="ts">
withDefaults(defineProps<{ price: number; oldPrice?: number | null; size?: 'sm' | 'lg' }>(), { size: 'sm' });
</script>

<template>
  <!-- Price 0 = not set: show nothing (old price / discount are meaningless without a price) -->
  <div v-if="price > 0" class="flex flex-wrap items-baseline gap-x-2.5">
    <span class="font-semibold text-espresso" :class="size === 'lg' ? 'text-h2 font-serif' : 'text-lg'">{{ formatPrice(price) }}</span>
    <s v-if="oldPrice && oldPrice > price" class="text-muted" :class="size === 'lg' ? 'text-lg' : 'text-sm'">
      <span class="sr-only">Նախկին գինը՝</span>{{ formatPrice(oldPrice) }}
    </s>
  </div>
</template>
