<script setup lang="ts">
import type { ProductCard } from '~/types/api';

const cart = useCartStore();
const api = useApi();
const toast = useToast();
const { confirm } = useConfirm();
const syncing = ref(false);
const changed = ref(false);

const blocked = computed(() => cart.items.filter((i) => i.availability === 'OUT_OF_STOCK'));

async function sync() {
  if (!cart.items.length) return;
  syncing.value = true;
  try {
    const fresh = await api<ProductCard[]>('/products/lookup', { method: 'POST', body: { ids: cart.items.map((i) => i.productId) } });
    changed.value = cart.sync(fresh);
  } catch {
    /* offline: keep local cart */
  } finally {
    syncing.value = false;
  }
}

onMounted(async () => {
  cart.hydrate();
  await sync();
});

function remove(id: string, name: string) {
  cart.remove(id);
  toast.info(`«${name.replace(/[«»]/g, '')}» հեռացվեց զամբյուղից`);
}

async function clearAll() {
  if (await confirm({ title: 'Մաքրե՞լ զամբյուղը', message: 'Զամբյուղի բոլոր ապրանքները կհեռացվեն։', confirmText: 'Մաքրել', danger: true })) {
    cart.clear();
  }
}

useSeo({ title: 'Զամբյուղ', noindex: true });
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Զամբյուղ' }]" />
    <h1 class="mt-6 text-h1">Զամբյուղ</h1>

    <ClientOnly>
      <UiEmptyState v-if="!cart.items.length" class="mt-10" icon="cart" title="Զամբյուղը դատարկ է" text="Ընտրեք կահույք մեր կատալոգից կամ պատվիրեք անհատական չափսերով։">
        <NuxtLink to="/catalog" class="btn-primary">Դիտել տեսականին</NuxtLink>
      </UiEmptyState>

      <div v-else class="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <p v-if="changed" class="mb-4 rounded-md border border-brass/40 bg-brass-light/30 px-4 py-3 text-sm text-walnut" role="status">
            Որոշ ապրանքների գինը կամ առկայությունը փոխվել է։ Զամբյուղը թարմացված է։
          </p>
          <ul class="divide-y divide-line border-y border-line">
            <li v-for="item in cart.items" :key="item.productId" class="grid grid-cols-[88px_1fr] gap-4 py-5 sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <NuxtLink :to="`/products/${item.slug}`" class="block overflow-hidden rounded-lg bg-cream">
                <UiImg :src="item.image" :alt="item.name" sizes="120px" :width="240" :height="180" img-class="aspect-[4/3] w-full object-cover" />
              </NuxtLink>
              <div class="min-w-0">
                <NuxtLink :to="`/products/${item.slug}`" class="font-serif text-lg leading-snug text-espresso hover:text-walnut">{{ item.name }}</NuxtLink>
                <div class="mt-1.5 flex flex-wrap items-center gap-2">
                  <UiAvailabilityBadge :value="item.availability" />
                  <span class="text-sm text-muted">{{ formatPrice(item.price) }} / հատ</span>
                </div>
                <div class="mt-3 flex items-center gap-3 sm:hidden">
                  <UiQuantityInput :model-value="item.quantity" small @update:model-value="(q) => cart.setQuantity(item.productId, q)" />
                  <span class="font-semibold text-espresso">{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
              <div class="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:justify-end">
                <div class="hidden items-center gap-5 sm:flex">
                  <UiQuantityInput :model-value="item.quantity" small @update:model-value="(q) => cart.setQuantity(item.productId, q)" />
                  <span class="w-28 text-right font-semibold text-espresso">{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
                <button type="button" class="ml-auto inline-flex items-center gap-1.5 rounded-md p-2 text-sm text-muted hover:bg-red-50 hover:text-red-700 sm:ml-0" :aria-label="`Հեռացնել ${item.name}`" @click="remove(item.productId, item.name)">
                  <UiIcon name="trash" :size="18" /><span class="sm:sr-only">Հեռացնել</span>
                </button>
              </div>
            </li>
          </ul>
          <div class="mt-4 flex justify-between">
            <NuxtLink to="/catalog" class="btn-ghost btn-sm"><UiIcon name="arrow-left" :size="16" />Շարունակել գնումները</NuxtLink>
            <button type="button" class="btn-ghost btn-sm text-muted" @click="clearAll">Մաքրել զամբյուղը</button>
          </div>
        </div>

        <aside class="h-fit rounded-card bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <h2 class="font-serif text-lg">Պատվերի ամփոփում</h2>
          <dl class="mt-5 space-y-3 text-base">
            <div class="flex justify-between"><dt class="text-muted">Ապրանքներ</dt><dd>{{ cart.count }} հատ</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Առաքում</dt><dd class="text-right">Կհամաձայնեցվի</dd></div>
          </dl>
          <div class="stitch my-5" aria-hidden="true" />
          <div class="flex items-baseline justify-between">
            <span class="font-medium">Ընդամենը</span>
            <span class="font-serif text-h2 text-espresso">{{ formatPrice(cart.total) }}</span>
          </div>
          <p v-if="blocked.length" class="mt-4 text-sm text-red-700">Հեռացրեք առկա չլինող ապրանքները՝ պատվերը շարունակելու համար։</p>
          <NuxtLink v-if="!blocked.length" to="/checkout" class="btn-primary mt-6 w-full" :class="{ 'pointer-events-none opacity-60': syncing }">Ձևակերպել պատվերը</NuxtLink>
          <button v-else type="button" class="btn-primary mt-6 w-full" disabled>Ձևակերպել պատվերը</button>
          <p class="mt-4 text-center text-sm text-muted">Վճարումը՝ ապրանքը ստանալիս</p>
        </aside>
      </div>

      <template #fallback>
        <div class="mt-8"><UiSpinner /></div>
      </template>
    </ClientOnly>
  </div>
</template>
