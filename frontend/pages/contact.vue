<script setup lang="ts">
const settings = useSiteSettings();
useSeo({
  title: 'Կապ',
  description: 'Կապվեք մեզ հետ՝ փափուկ կահույքի գնման, պատվերով կահույքի կամ կահույքի վերանորոգման համար Երևանում։ Հեռախոս, WhatsApp, հասցե և աշխատանքային ժամեր։',
});
useLocalBusinessLd();
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Կապ' }]" />
    <h1 class="mt-6 text-h1">Կապվեք մեզ հետ</h1>
    <p class="mt-3 max-w-xl text-lg text-muted">Զանգահարեք, գրեք WhatsApp-ով կամ թողեք հաղորդագրություն․ կպատասխանենք աշխատանքային ժամերին։</p>

    <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_1.25fr]">
      <div class="space-y-6">
        <ul class="divide-y divide-line rounded-card border border-line bg-white">
          <li v-if="settings?.phone" class="flex items-center gap-4 p-5">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-brass"><UiIcon name="phone" /></span>
            <div><p class="text-sm text-muted">Հեռախոս</p><a :href="telLink(settings.phone)" class="text-lg font-medium text-espresso hover:text-walnut">{{ formatPhone(settings.phone) }}</a></div>
          </li>
          <li v-if="settings?.phone2" class="flex items-center gap-4 p-5">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-brass"><UiIcon name="phone" /></span>
            <div><p class="text-sm text-muted">Հեռախոս 2</p><a :href="telLink(settings.phone2)" class="text-lg font-medium text-espresso hover:text-walnut">{{ formatPhone(settings.phone2) }}</a></div>
          </li>
          <li v-if="settings?.whatsapp" class="flex items-center gap-4 p-5">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-brass"><UiIcon name="whatsapp" /></span>
            <div><p class="text-sm text-muted">WhatsApp</p><a :href="whatsappLink(settings.whatsapp)" target="_blank" rel="noopener" class="text-lg font-medium text-espresso hover:text-walnut">{{ formatPhone(settings.whatsapp) }}</a></div>
          </li>
          <li v-if="settings?.address" class="flex items-center gap-4 p-5">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-brass"><UiIcon name="pin" /></span>
            <div><p class="text-sm text-muted">Հասցե</p><p class="text-lg text-espresso">{{ settings.address }}</p></div>
          </li>
          <li v-if="settings?.workingHours" class="flex items-center gap-4 p-5">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-brass"><UiIcon name="clock" /></span>
            <div><p class="text-sm text-muted">Աշխատանքային ժամեր</p><p class="text-lg text-espresso">{{ settings.workingHours }}</p></div>
          </li>
        </ul>
        <div class="flex gap-3">
          <a v-if="settings?.instagramUrl" :href="settings.instagramUrl" target="_blank" rel="noopener" class="btn-outline flex-1"><UiIcon name="instagram" :size="18" />Instagram</a>
          <a v-if="settings?.tiktokUrl" :href="settings.tiktokUrl" target="_blank" rel="noopener" class="btn-outline flex-1"><UiIcon name="tiktok" :size="18" />TikTok</a>
          <a v-if="settings?.facebookUrl" :href="settings.facebookUrl" target="_blank" rel="noopener" class="btn-outline flex-1"><UiIcon name="facebook" :size="18" />Facebook</a>
        </div>
      </div>

      <div class="rounded-card bg-cream p-5 sm:p-8">
        <h2 class="font-serif text-h2">Հետադարձ կապ</h2>
        <p class="mb-6 mt-1 text-muted">Թողեք ձեր տվյալները, և մենք կզանգահարենք ձեզ։</p>
        <FormsContactForm source="CONTACT" />
      </div>
    </div>

    <div v-if="settings?.mapEmbedUrl" class="mt-12 overflow-hidden rounded-card border border-line">
      <iframe
        :src="settings.mapEmbedUrl"
        title="Մեր հասցեն քարտեզի վրա"
        class="h-[380px] w-full"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      />
    </div>
  </div>
</template>
