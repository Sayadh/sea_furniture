<script setup lang="ts">
import type { Order, OrderStatus, Paginated } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const { request } = useAdminApi();
const route = useRoute();
const router = useRouter();
const statuses = Object.keys(orderStatusLabel) as OrderStatus[];

const q = reactive({
  search: String(route.query.search ?? ''),
  status: String(route.query.status ?? ''),
  dateFrom: String(route.query.dateFrom ?? ''),
  dateTo: String(route.query.dateTo ?? ''),
  archived: route.query.archived === '1',
  page: Number(route.query.page ?? 1),
});
const result = ref<Paginated<Order> | null>(null);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  const query: Record<string, string> = {};
  if (q.search) query.search = q.search;
  if (q.status) query.status = q.status;
  if (q.dateFrom) query.dateFrom = q.dateFrom;
  if (q.dateTo) query.dateTo = q.dateTo;
  if (q.archived) query.archived = '1';
  if (q.page > 1) query.page = String(q.page);
  router.replace({ query });
  try {
    result.value = await request<Paginated<Order>>('/admin/orders', { query: { ...query, archived: q.archived ? 'true' : undefined, page: q.page, limit: 25 } });
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);
let t: ReturnType<typeof setTimeout> | undefined;
watch(() => q.search, () => { clearTimeout(t); t = setTimeout(() => { q.page = 1; load(); }, 350); });
watch(() => [q.status, q.dateFrom, q.dateTo, q.archived], () => { q.page = 1; load(); });
const hasFilters = computed(() => !!(q.search || q.status || q.dateFrom || q.dateTo));
function reset() { Object.assign(q, { search: '', status: '', dateFrom: '', dateTo: '', page: 1 }); }
</script>

<template>
  <div>
    <AdminPageHeader title="Պատվերներ" :subtitle="result ? `Գտնվել է ${result.total}` : undefined">
      <div class="inline-flex rounded-md border border-line bg-white p-0.5 text-sm">
        <button type="button" class="rounded px-3 py-1.5" :class="!q.archived ? 'bg-espresso text-linen' : 'text-muted'" @click="q.archived = false">Ակտիվ</button>
        <button type="button" class="rounded px-3 py-1.5" :class="q.archived ? 'bg-espresso text-linen' : 'text-muted'" @click="q.archived = true">Արխիվ</button>
      </div>
    </AdminPageHeader>

    <div class="mb-3 flex gap-2 overflow-x-auto pb-1">
      <button type="button" class="badge shrink-0 px-3 py-1.5 text-sm" :class="!q.status ? 'bg-espresso text-linen' : 'bg-white ring-1 ring-line'" @click="q.status = ''">Բոլորը</button>
      <button v-for="s in statuses" :key="s" type="button" class="badge shrink-0 px-3 py-1.5 text-sm" :class="q.status === s ? 'bg-espresso text-linen' : 'bg-white ring-1 ring-line'" @click="q.status = s">{{ orderStatusLabel[s] }}</button>
    </div>
    <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_170px_170px_auto]">
      <label class="relative">
        <span class="sr-only">Որոնում</span>
        <UiIcon name="search" :size="17" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="q.search" type="search" class="input pl-9" placeholder="Հեռախոսահամար, պատվերի համար կամ անուն" />
      </label>
      <label><span class="sr-only">Սկսած</span><input v-model="q.dateFrom" type="date" class="input" aria-label="Ամսաթիվ՝ սկսած" /></label>
      <label><span class="sr-only">Մինչև</span><input v-model="q.dateTo" type="date" class="input" aria-label="Ամսաթիվ՝ մինչև" /></label>
      <button v-if="hasFilters" type="button" class="btn-ghost btn-sm" @click="reset">Մաքրել</button>
    </div>

    <UiErrorState v-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!loading && !result?.items.length" icon="receipt" :title="q.archived ? 'Արխիվը դատարկ է' : 'Պատվերներ չեն գտնվել'" :text="hasFilters ? 'Փորձեք փոխել ֆիլտրերը։' : undefined" />
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white" :class="{ 'opacity-60': loading }">
      <table class="w-full min-w-[820px] text-sm">
        <thead class="border-b border-line bg-linen text-left text-sm text-muted">
          <tr><th class="px-4 py-3">Պատվեր</th><th class="px-3 py-3">Հաճախորդ</th><th class="px-3 py-3">Հասցե</th><th class="px-3 py-3 text-right">Գումար</th><th class="px-3 py-3">Կարգավիճակ</th><th class="px-3 py-3" /></tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="o in result?.items" :key="o.id" class="cursor-pointer hover:bg-linen/60" @click="navigateTo(`/admin/orders/${o.id}`)">
            <td class="px-4 py-3"><NuxtLink :to="`/admin/orders/${o.id}`" class="font-medium text-espresso hover:underline" @click.stop>{{ o.orderNumber }}</NuxtLink><div class="text-sm text-muted">{{ formatDate(o.createdAt, true) }}</div></td>
            <td class="px-3 py-3">{{ o.firstName }} {{ o.lastName }}<div class="text-sm text-muted">{{ formatPhone(o.phone) }}</div></td>
            <td class="max-w-[220px] truncate px-3 py-3 text-muted">{{ o.region }}, {{ o.address }}</td>
            <td class="px-3 py-3 text-right"><div class="font-medium">{{ formatPrice(o.totalAmount) }}</div><div class="text-sm text-muted">{{ o.itemsCount }} հատ</div></td>
            <td class="px-3 py-3"><AdminStatusBadge :status="o.status" /></td>
            <td class="px-3 py-3 text-right"><UiIcon name="chevron-right" :size="16" class="text-muted" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="result" class="mt-5"><UiPagination :page="result.page" :pages="result.pages" @change="(p) => { q.page = p; load(); }" /></div>
  </div>
</template>
