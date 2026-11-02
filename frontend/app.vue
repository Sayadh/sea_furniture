<script setup lang="ts">
const settings = useSiteSettings();
const config = useRuntimeConfig();

useHead({
  titleTemplate: (t) => t || settings.value?.seoTitle || config.public.siteName,
  meta: config.public.googleSiteVerification
    ? [{ name: 'google-site-verification', content: String(config.public.googleSiteVerification) }]
    : [],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
  <UiConfirmDialog />
</template>
