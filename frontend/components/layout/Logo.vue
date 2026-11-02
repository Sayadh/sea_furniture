<script setup lang="ts">
defineProps<{ light?: boolean }>();
const settings = useSiteSettings();
</script>

<template>
  <NuxtLink to="/" class="group inline-flex items-center gap-2.5" :aria-label="`${settings?.siteName || 'Sea Furniture'} — գլխավոր էջ`">
    <!-- A logo uploaded in Admin → Settings overrides the built-in brand mark -->
    <img v-if="settings?.logoUrl" :src="settings.logoUrl" :alt="settings.siteName" class="h-10 w-auto" width="160" height="40" />
    <template v-else>
      <!-- "S + sofa" mark from the brand logo; the light version (cream instead of black) is for dark backgrounds -->
      <img
        :src="light ? '/logo-mark-light.png' : '/logo-mark.png'"
        alt=""
        width="192"
        height="160"
        class="h-10 w-auto lg:h-11"
        aria-hidden="true"
      />
      <span class="flex flex-col leading-none" :class="light ? 'text-linen' : 'text-espresso'">
        <span class="font-serif text-lg font-semibold tracking-[0.2em]" style="font-stretch: 100%">SEA</span>
        <span class="mt-1 text-sm font-medium uppercase tracking-[0.28em]" :class="light ? 'text-linen/80' : 'text-ink/80'">Furniture</span>
      </span>
    </template>
  </NuxtLink>
</template>
