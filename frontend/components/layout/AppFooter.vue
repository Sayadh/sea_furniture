<script setup lang="ts">
import { mainNav } from '~/composables/useNav';

const settings = useSiteSettings();
const { data: categories } = await useCategories();
const year = new Date().getFullYear();
</script>

<template>
  <footer class="bg-espresso text-linen/80">
    <div class="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
      <div>
        <LayoutLogo light />
        <p class="mt-5 max-w-xs text-base leading-relaxed text-linen/65">
          Պրեմիում փափուկ կահույքի վաճառք, պատվերով արտադրություն և վերանորոգում։ Երևանի արտադրամասից առաքում ենք ամբողջ Հայաստանում։ Որակյալ նյութեր, փորձառու վարպետներ և մինչև 2 տարի երաշխիք։
        </p>
        <div class="mt-6 flex gap-2">
          <a v-if="settings?.instagramUrl" :href="settings.instagramUrl" target="_blank" rel="noopener" class="rounded-md border border-linen/15 p-2.5 hover:border-brass hover:text-brass" aria-label="Instagram">
            <UiIcon name="instagram" :size="18" />
          </a>
          <a v-if="settings?.tiktokUrl" :href="settings.tiktokUrl" target="_blank" rel="noopener" class="rounded-md border border-linen/15 p-2.5 hover:border-brass hover:text-brass" aria-label="TikTok">
            <UiIcon name="tiktok" :size="18" />
          </a>
          <a v-if="settings?.facebookUrl" :href="settings.facebookUrl" target="_blank" rel="noopener" class="rounded-md border border-linen/15 p-2.5 hover:border-brass hover:text-brass" aria-label="Facebook">
            <UiIcon name="facebook" :size="18" />
          </a>
        </div>
      </div>

      <div>
        <h2 class="font-serif text-lg text-linen">Կատալոգ</h2>
        <ul class="mt-4 space-y-2.5 text-base">
          <li v-for="c in categories" :key="c.id"><NuxtLink :to="`/catalog/${c.slug}`" class="hover:text-brass">{{ c.name }}</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h2 class="font-serif text-lg text-linen">Ընկերություն</h2>
        <ul class="mt-4 space-y-2.5 text-base">
          <li v-for="item in mainNav.slice(1)" :key="item.to"><NuxtLink :to="item.to" class="hover:text-brass">{{ item.label }}</NuxtLink></li>
          <li><NuxtLink to="/kahuyq-hayastanum" class="hover:text-brass">Առաքում Հայաստանում</NuxtLink></li>
          <li><NuxtLink to="/inchpes-yntrel-papuk-kahuyq" class="hover:text-brass">Ինչպես ընտրել կահույք</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h2 class="font-serif text-lg text-linen">Կապ</h2>
        <ul class="mt-4 space-y-3 text-base">
          <li v-if="settings?.phone"><a :href="telLink(settings.phone)" class="flex items-center gap-2.5 hover:text-brass"><UiIcon name="phone" :size="17" class="text-brass" />{{ formatPhone(settings.phone) }}</a></li>
          <li v-if="settings?.phone2"><a :href="telLink(settings.phone2)" class="flex items-center gap-2.5 hover:text-brass"><UiIcon name="phone" :size="17" class="text-brass" />{{ formatPhone(settings.phone2) }}</a></li>
          <li v-if="settings?.whatsapp"><a :href="whatsappLink(settings.whatsapp)" target="_blank" rel="noopener" class="flex items-center gap-2.5 hover:text-brass"><UiIcon name="whatsapp" :size="17" class="text-brass" />WhatsApp</a></li>
          <li v-if="settings?.address" class="flex items-start gap-2.5"><UiIcon name="pin" :size="17" class="mt-1 shrink-0 text-brass" />{{ settings.address }}</li>
          <li v-if="settings?.workingHours" class="flex items-start gap-2.5"><UiIcon name="clock" :size="17" class="mt-1 shrink-0 text-brass" />{{ settings.workingHours }}</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-linen/10">
      <div class="container flex flex-col gap-2 py-5 text-sm text-linen/50 sm:flex-row sm:justify-between">
        <p>© {{ year }} {{ settings?.siteName || 'Sea Furniture' }}։ Բոլոր իրավունքները պաշտպանված են։</p>
        <p>Փափուկ կահույքի վաճառք և վերանորոգում ամբողջ Հայաստանում</p>
      </div>
    </div>
  </footer>
</template>
