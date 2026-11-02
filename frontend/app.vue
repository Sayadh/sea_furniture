<script setup lang="ts">
const settings = useSiteSettings();
const config = useRuntimeConfig();

useHead({
  titleTemplate: (t) => t || settings.value?.seoTitle || config.public.siteName,
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
  <UiConfirmDialog />
</template>
