<script setup lang="ts">
const route = useRoute();
const settings = useSiteSettings();
const lastOrder = useState<{ orderNumber: string; totalAmount: number; itemsCount: number } | null>('last-order', () => null);
const orderNumber = computed(() => (typeof route.query.n === 'string' && /^SF-\d{6}-[A-Z0-9]{4}$/.test(route.query.n) ? route.query.n : lastOrder.value?.orderNumber));

useSeo({ title: 'Պատվերն ընդունված է', noindex: true });
</script>

<template>
  <div class="container flex justify-center py-16 md:py-24">
    <div class="w-full max-w-xl text-center">
      <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-brass bg-cream text-brass"><UiIcon name="check" :size="30" /></span>
      <h1 class="mt-6 text-h1">Շնորհակալություն, պատվերն ընդունված է</h1>
      <p v-if="orderNumber" class="mt-4 text-lg text-muted">Ձեր պատվերի համարը՝</p>
      <p v-if="orderNumber" class="mt-1 font-serif text-h2 tracking-wide text-espresso">{{ orderNumber }}</p>
      <p v-if="lastOrder && lastOrder.orderNumber === orderNumber" class="mt-2 text-muted">{{ lastOrder.itemsCount }} ապրանք, ընդամենը՝ {{ formatPrice(lastOrder.totalAmount) }}</p>
      <div class="stitch mx-auto my-8 w-32" aria-hidden="true" />
      <p class="text-ink/80">Մեր մենեջերը կզանգահարի ձեզ մոտակա աշխատանքային ժամերին՝ պատվերը հաստատելու և առաքման մանրամասները համաձայնեցնելու համար։ Պահպանեք պատվերի համարը։</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <NuxtLink to="/catalog" class="btn-primary">Շարունակել գնումները</NuxtLink>
        <a v-if="settings?.whatsapp" :href="whatsappLink(settings.whatsapp, orderNumber ? `Բարև Ձեզ, իմ պատվերի համարն է ${orderNumber}` : undefined)" target="_blank" rel="noopener" class="btn-outline">
          <UiIcon name="whatsapp" :size="18" />Գրել WhatsApp-ով
        </a>
      </div>
    </div>
  </div>
</template>
