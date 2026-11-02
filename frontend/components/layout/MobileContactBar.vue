<script setup lang="ts">
const settings = useSiteSettings();
const cart = useCartStore();
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:hidden" style="padding-bottom: env(safe-area-inset-bottom)">
    <div class="grid grid-cols-3 text-sm font-medium text-espresso">
      <a :href="telLink(settings?.phone)" class="flex flex-col items-center gap-1 py-2.5 active:bg-cream">
        <UiIcon name="phone" :size="20" class="text-brass" />Զանգել
      </a>
      <a :href="whatsappLink(settings?.whatsapp, 'Բարև Ձեզ, հետաքրքրված եմ ձեր կահույքով։')" target="_blank" rel="noopener" class="flex flex-col items-center gap-1 border-x border-line py-2.5 active:bg-cream">
        <UiIcon name="whatsapp" :size="20" class="text-[#25A35A]" />WhatsApp
      </a>
      <NuxtLink to="/cart" class="relative flex flex-col items-center gap-1 py-2.5 active:bg-cream">
        <span class="relative">
          <UiIcon name="cart" :size="20" class="text-brass" />
          <ClientOnly>
            <span v-if="cart.count" class="absolute -right-2.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso px-1 text-sm leading-none text-linen">{{ cart.count }}</span>
          </ClientOnly>
        </span>
        Զամբյուղ
      </NuxtLink>
    </div>
  </div>
</template>
