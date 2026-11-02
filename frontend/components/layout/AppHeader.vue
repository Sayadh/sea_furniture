<script setup lang="ts">
import { mainNav } from '~/composables/useNav';

const settings = useSiteSettings();
const cart = useCartStore();
const route = useRoute();
const open = ref(false);

watch(() => route.fullPath, () => (open.value = false));
watch(open, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : '';
});
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`);
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line/80">
    <!--
      Blur lives on its own layer: backdrop-filter on <header> itself would become the containing block
      for the fixed mobile menu below and collapse it to 0 height.
    -->
    <div class="absolute inset-0 -z-10 bg-linen/90 backdrop-blur supports-[backdrop-filter]:bg-linen/80" aria-hidden="true" />
    <div class="container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
      <LayoutLogo />

      <nav class="hidden lg:block" aria-label="Հիմնական մենյու">
        <ul class="flex items-center gap-1">
          <li v-for="item in mainNav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="relative rounded-md px-3 py-2 text-base text-ink/80 transition-colors hover:text-espresso"
              :class="{ 'text-espresso font-medium': isActive(item.to) }"
            >
              {{ item.label }}
              <span v-if="isActive(item.to)" class="stitch absolute inset-x-3 -bottom-0.5" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1 sm:gap-2">
        <a v-if="settings?.phone" :href="telLink(settings.phone)" class="hidden items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-espresso hover:bg-cream xl:inline-flex">
          <UiIcon name="phone" :size="18" class="text-brass" />{{ formatPhone(settings.phone) }}
        </a>
        <NuxtLink to="/cart" class="relative rounded-md p-2.5 text-espresso hover:bg-cream" :aria-label="`Զամբյուղ, ${cart.count} ապրանք`">
          <UiIcon name="cart" :size="22" />
          <ClientOnly>
            <span v-if="cart.count" class="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1 text-sm font-semibold leading-none text-espresso">
              {{ cart.count > 99 ? '99+' : cart.count }}
            </span>
          </ClientOnly>
        </NuxtLink>
        <button type="button" class="rounded-md p-2.5 text-espresso hover:bg-cream lg:hidden" :aria-expanded="open" aria-controls="mobile-menu" aria-label="Մենյու" @click="open = !open">
          <UiIcon :name="open ? 'x' : 'menu'" :size="24" />
        </button>
      </div>
    </div>

    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="open" id="mobile-menu" class="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-linen lg:hidden">
        <nav class="container py-6" aria-label="Մոբայլ մենյու">
          <ul class="divide-y divide-line">
            <li v-for="item in mainNav" :key="item.to">
              <NuxtLink :to="item.to" class="flex items-center justify-between py-4 font-serif text-lg text-espresso">
                {{ item.label }}<UiIcon name="chevron-right" class="text-brass" />
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-8 space-y-3">
            <a v-if="settings?.phone" :href="telLink(settings.phone)" class="btn-primary w-full"><UiIcon name="phone" :size="18" /> {{ formatPhone(settings.phone) }}</a>
            <a v-if="settings?.whatsapp" :href="whatsappLink(settings.whatsapp)" target="_blank" rel="noopener" class="btn-outline w-full"><UiIcon name="whatsapp" :size="18" /> Գրել WhatsApp-ով</a>
          </div>
          <p v-if="settings?.workingHours" class="mt-6 text-center text-sm text-muted">{{ settings.workingHours }}</p>
        </nav>
      </div>
    </Transition>
  </header>
</template>
