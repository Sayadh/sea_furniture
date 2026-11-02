<script setup lang="ts">
/** Lazy, responsive image with intrinsic aspect ratio to avoid layout shift (CLS). */
withDefaults(
  defineProps<{
    src?: string | null;
    alt: string;
    sizes?: string;
    eager?: boolean;
    width?: number;
    height?: number;
    imgClass?: string;
  }>(),
  { sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', width: 1200, height: 900 },
);
</script>

<template>
  <img
    v-if="src"
    :src="imageAt(src, 1200)"
    :srcset="imageSrcset(src)"
    :sizes="sizes"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    decoding="async"
    :class="imgClass"
  />
  <div v-else class="flex items-center justify-center bg-cream text-brass" :class="imgClass" role="img" :aria-label="alt">
    <UiIcon name="image" :size="32" />
  </div>
</template>
