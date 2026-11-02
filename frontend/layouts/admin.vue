<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();
const { confirm } = useConfirm();
const open = ref(false);

const nav = [
  { to: '/admin', label: 'Վահանակ', icon: 'grid', exact: true },
  { to: '/admin/orders', label: 'Պատվերներ', icon: 'receipt' },
  { to: '/admin/requests', label: 'Հարցումներ', icon: 'inbox' },
  { to: '/admin/products', label: 'Ապրանքներ', icon: 'box' },
  { to: '/admin/categories', label: 'Բաժիններ', icon: 'folder' },
  { to: '/admin/services', label: 'Ծառայություններ', icon: 'wrench' },
  { to: '/admin/portfolio', label: 'Աշխատանքներ', icon: 'photo' },
  { to: '/admin/faqs', label: 'Հարցեր (FAQ)', icon: 'help' },
  { to: '/admin/settings', label: 'Կարգավորումներ', icon: 'settings' },
];
const isActive = (item: (typeof nav)[number]) => (item.exact ? route.path === item.to : route.path.startsWith(item.to));
watch(() => route.fullPath, () => (open.value = false));

async function logout() {
  if (!(await confirm({ title: 'Դուրս գալ', message: 'Ցանկանու՞մ եք դուրս գալ ադմինկայից։', confirmText: 'Դուրս գալ' }))) return;
  await auth.logout();
  await navigateTo('/admin/login');
}

useHead({ title: 'Ադմինկա', meta: [{ name: 'robots', content: 'noindex, nofollow' }] });
</script>

<template>
  <div class="min-h-screen bg-[#F7F3EE]">
    <!-- Mobile top bar -->
    <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
      <button type="button" class="rounded-md p-2 hover:bg-cream" aria-label="Մենյու" @click="open = true"><UiIcon name="menu" /></button>
      <span class="font-serif text-lg">Ադմինկա</span>
      <NuxtLink to="/" target="_blank" class="rounded-md p-2 hover:bg-cream" aria-label="Բացել կայքը"><UiIcon name="external" :size="18" /></NuxtLink>
    </header>

    <div v-if="open" class="fixed inset-0 z-40 bg-espresso/40 lg:hidden" @click="open = false" />
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-espresso text-linen/80 transition-transform lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center justify-between px-5">
        <LayoutLogo light />
        <button type="button" class="rounded-md p-1.5 hover:bg-linen/10 lg:hidden" aria-label="Փակել" @click="open = false"><UiIcon name="x" /></button>
      </div>
      <nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Ադմինկայի մենյու">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors"
          :class="isActive(item) ? 'bg-linen/10 text-linen' : 'hover:bg-linen/5 hover:text-linen'"
        >
          <UiIcon :name="item.icon" :size="18" :class="isActive(item) ? 'text-brass' : ''" />{{ item.label }}
        </NuxtLink>
      </nav>
      <div class="border-t border-linen/10 p-4">
        <p class="truncate text-sm text-linen">{{ auth.admin?.name }}</p>
        <p class="truncate text-sm text-linen/50">{{ auth.admin?.email }}</p>
        <div class="mt-3 flex gap-2">
          <NuxtLink to="/" target="_blank" class="btn-sm flex-1 rounded-md border border-linen/15 text-linen/80 hover:bg-linen/10 inline-flex items-center justify-center gap-1.5">
            <UiIcon name="external" :size="15" />Կայք
          </NuxtLink>
          <button type="button" class="btn-sm flex-1 rounded-md border border-linen/15 text-linen/80 hover:bg-linen/10 inline-flex items-center justify-center gap-1.5" @click="logout">
            <UiIcon name="logout" :size="15" />Ելք
          </button>
        </div>
      </div>
    </aside>

    <main class="lg:pl-64">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><slot /></div>
    </main>
  </div>
</template>
