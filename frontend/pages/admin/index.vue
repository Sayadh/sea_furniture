<script setup lang="ts">
import type { Order, OrderStatus, RepairRequest } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

interface Dashboard {
  counts: { productsTotal: number; productsActive: number; newOrders: number; newRequests: number; requestsTotal: number };
  salesByStatus: { status: OrderStatus; count: number; total: number }[];
  recentOrders: Pick<Order, 'id' | 'orderNumber' | 'firstName' | 'lastName' | 'phone' | 'totalAmount' | 'status' | 'createdAt'>[];
  recentRequests: Pick<RepairRequest, 'id' | 'requestNumber' | 'name' | 'phone' | 'source' | 'serviceTitle' | 'status' | 'createdAt'>[];
  topViewed: { id: string; name: string; slug: string; viewCount: number; price: number; images: { url: string }[] }[];
}

const { request } = useAdminApi();
const data = ref<Dashboard | null>(null);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    data.value = await request<Dashboard>('/admin/dashboard');
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const maxSales = computed(() => Math.max(1, ...(data.value?.salesByStatus.map((s) => s.total) ?? [1])));
const activeSales = computed(() => data.value?.salesByStatus.filter((s) => s.status !== 'CANCELLED').reduce((a, s) => a + s.total, 0) ?? 0);
</script>

<template>
  <div>
    <AdminPageHeader title="Վահանակ" subtitle="Կայքի ընդհանուր պատկերը" />
    <UiSpinner v-if="loading && !data" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <template v-else-if="data">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NuxtLink to="/admin/orders?status=NEW" class="rounded-xl border border-line bg-white p-5 hover:border-brass">
          <p class="flex items-center gap-2 text-sm text-muted"><UiIcon name="receipt" :size="16" class="text-brass" />Նոր պատվերներ</p>
          <p class="mt-2 font-serif text-h2 text-espresso">{{ data.counts.newOrders }}</p>
        </NuxtLink>
        <NuxtLink to="/admin/requests?status=NEW" class="rounded-xl border border-line bg-white p-5 hover:border-brass">
          <p class="flex items-center gap-2 text-sm text-muted"><UiIcon name="inbox" :size="16" class="text-brass" />Նոր հարցումներ</p>
          <p class="mt-2 font-serif text-h2 text-espresso">{{ data.counts.newRequests }}</p>
          <p class="text-sm text-muted">ընդամենը՝ {{ data.counts.requestsTotal }}</p>
        </NuxtLink>
        <NuxtLink to="/admin/products" class="rounded-xl border border-line bg-white p-5 hover:border-brass">
          <p class="flex items-center gap-2 text-sm text-muted"><UiIcon name="box" :size="16" class="text-brass" />Ապրանքներ</p>
          <p class="mt-2 font-serif text-h2 text-espresso">{{ data.counts.productsTotal }}</p>
          <p class="text-sm text-muted">ակտիվ՝ {{ data.counts.productsActive }}</p>
        </NuxtLink>
        <div class="rounded-xl border border-line bg-espresso p-5 text-linen">
          <p class="text-sm text-linen/60">Վաճառքի արժեք (առանց չեղարկվածների)</p>
          <p class="mt-2 font-serif text-h2">{{ formatPrice(activeSales) }}</p>
        </div>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AdminCard title="Վերջին պատվերներ">
          <template #actions><NuxtLink to="/admin/orders" class="text-sm text-walnut hover:underline">Բոլորը</NuxtLink></template>
          <UiEmptyState v-if="!data.recentOrders.length" icon="receipt" title="Պատվերներ դեռ չկան" />
          <div v-else class="-mx-5 -my-5 overflow-x-auto">
            <table class="w-full min-w-[560px] text-sm">
              <tbody class="divide-y divide-line">
                <tr v-for="o in data.recentOrders" :key="o.id" class="hover:bg-linen">
                  <td class="px-5 py-3"><NuxtLink :to="`/admin/orders/${o.id}`" class="font-medium text-espresso hover:underline">{{ o.orderNumber }}</NuxtLink><div class="text-sm text-muted">{{ formatDate(o.createdAt, true) }}</div></td>
                  <td class="px-3 py-3">{{ o.firstName }} {{ o.lastName }}<div class="text-sm text-muted">{{ formatPhone(o.phone) }}</div></td>
                  <td class="px-3 py-3 text-right font-medium">{{ formatPrice(o.totalAmount) }}</td>
                  <td class="px-5 py-3 text-right"><AdminStatusBadge :status="o.status" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard title="Վաճառքն ըստ կարգավիճակի">
          <ul class="space-y-3.5">
            <li v-for="s in data.salesByStatus" :key="s.status">
              <div class="mb-1 flex justify-between text-sm">
                <span>{{ orderStatusLabel[s.status] }} <span class="text-muted">({{ s.count }})</span></span>
                <span class="font-medium">{{ formatPrice(s.total) }}</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-cream">
                <div class="h-full rounded-full" :class="s.status === 'CANCELLED' ? 'bg-stone-400' : 'bg-brass'" :style="{ width: `${(s.total / maxSales) * 100}%` }" />
              </div>
            </li>
          </ul>
        </AdminCard>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard title="Վերջին հարցումներ">
          <template #actions><NuxtLink to="/admin/requests" class="text-sm text-walnut hover:underline">Բոլորը</NuxtLink></template>
          <UiEmptyState v-if="!data.recentRequests.length" icon="inbox" title="Հարցումներ դեռ չկան" />
          <ul v-else class="-my-2 divide-y divide-line">
            <li v-for="r in data.recentRequests" :key="r.id" class="flex items-center justify-between gap-3 py-3">
              <div class="min-w-0">
                <NuxtLink :to="`/admin/requests/${r.id}`" class="font-medium text-espresso hover:underline">{{ r.name }}</NuxtLink>
                <p class="truncate text-sm text-muted">{{ requestSourceLabel[r.source] }}<template v-if="r.serviceTitle"> · {{ r.serviceTitle }}</template> · {{ formatDate(r.createdAt, true) }}</p>
              </div>
              <AdminStatusBadge :status="r.status" kind="request" />
            </li>
          </ul>
        </AdminCard>

        <AdminCard title="Ամենաշատ դիտված ապրանքներ">
          <ul class="-my-2 divide-y divide-line">
            <li v-for="p in data.topViewed" :key="p.id" class="flex items-center gap-3 py-2.5">
              <img v-if="p.images[0]" :src="imageAt(p.images[0].url, 160)" alt="" class="h-11 w-14 rounded object-cover" />
              <NuxtLink :to="`/admin/products/${p.id}`" class="min-w-0 flex-1 truncate text-sm text-espresso hover:underline">{{ p.name }}</NuxtLink>
              <span class="flex items-center gap-1 text-sm text-muted"><UiIcon name="eye" :size="15" />{{ p.viewCount }}</span>
            </li>
          </ul>
        </AdminCard>
      </div>
    </template>
  </div>
</template>
