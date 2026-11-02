<script setup lang="ts">
import type { Paginated, RepairRequest, RequestSource, RequestStatus } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const { request } = useAdminApi();
const route = useRoute();
const router = useRouter();
const statuses = Object.keys(requestStatusLabel) as RequestStatus[];
const sources = Object.keys(requestSourceLabel) as RequestSource[];

const q = reactive({
  search: String(route.query.search ?? ''),
  status: String(route.query.status ?? ''),
  source: String(route.query.source ?? ''),
  archived: route.query.archived === '1',
  page: Number(route.query.page ?? 1),
});
const result = ref<Paginated<RepairRequest> | null>(null);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  const query: Record<string, string> = {};
  if (q.search) query.search = q.search;
  if (q.status) query.status = q.status;
  if (q.source) query.source = q.source;
  if (q.archived) query.archived = '1';
  if (q.page > 1) query.page = String(q.page);
  router.replace({ query });
  try {
    result.value = await request<Paginated<RepairRequest>>('/admin/requests', { query: { ...query, archived: q.archived ? 'true' : undefined, page: q.page, limit: 25 } });
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);
let t: ReturnType<typeof setTimeout> | undefined;
watch(() => q.search, () => { clearTimeout(t); t = setTimeout(() => { q.page = 1; load(); }, 350); });
watch(() => [q.status, q.source, q.archived], () => { q.page = 1; load(); });
</script>

<template>
  <div>
    <AdminPageHeader title="Հարցումներ" subtitle="Վերանորոգման հարցումներ, խորհրդատվություն և հետադարձ կապ">
      <div class="inline-flex rounded-md border border-line bg-white p-0.5 text-sm">
        <button type="button" class="rounded px-3 py-1.5" :class="!q.archived ? 'bg-espresso text-linen' : 'text-muted'" @click="q.archived = false">Ակտիվ</button>
        <button type="button" class="rounded px-3 py-1.5" :class="q.archived ? 'bg-espresso text-linen' : 'text-muted'" @click="q.archived = true">Արխիվ</button>
      </div>
    </AdminPageHeader>
    <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_200px_200px]">
      <label class="relative">
        <span class="sr-only">Որոնում</span>
        <UiIcon name="search" :size="17" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="q.search" type="search" class="input pl-9" placeholder="Հեռախոսահամար, անուն կամ հարցման համար" />
      </label>
      <select v-model="q.source" class="input" aria-label="Տեսակ">
        <option value="">Բոլոր տեսակները</option>
        <option v-for="s in sources" :key="s" :value="s">{{ requestSourceLabel[s] }}</option>
      </select>
      <select v-model="q.status" class="input" aria-label="Կարգավիճակ">
        <option value="">Բոլոր կարգավիճակները</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ requestStatusLabel[s] }}</option>
      </select>
    </div>

    <UiErrorState v-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!loading && !result?.items.length" icon="inbox" title="Հարցումներ չեն գտնվել" />
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white" :class="{ 'opacity-60': loading }">
      <table class="w-full min-w-[800px] text-sm">
        <thead class="border-b border-line bg-linen text-left text-sm text-muted">
          <tr><th class="px-4 py-3">Հարցում</th><th class="px-3 py-3">Հաճախորդ</th><th class="px-3 py-3">Տեսակ / ծառայություն</th><th class="px-3 py-3 text-center"><UiIcon name="photo" :size="15" class="inline" /></th><th class="px-3 py-3">Կարգավիճակ</th><th class="px-3 py-3" /></tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="r in result?.items" :key="r.id" class="cursor-pointer hover:bg-linen/60" @click="navigateTo(`/admin/requests/${r.id}`)">
            <td class="px-4 py-3"><NuxtLink :to="`/admin/requests/${r.id}`" class="font-medium text-espresso hover:underline" @click.stop>{{ r.requestNumber }}</NuxtLink><div class="text-sm text-muted">{{ formatDate(r.createdAt, true) }}</div></td>
            <td class="px-3 py-3">{{ r.name }}<div class="text-sm text-muted">{{ formatPhone(r.phone) }}</div></td>
            <td class="px-3 py-3">{{ requestSourceLabel[r.source] }}<div v-if="r.serviceTitle" class="text-sm text-muted">{{ r.serviceTitle }}</div></td>
            <td class="px-3 py-3 text-center text-muted">{{ r._count?.images || '—' }}</td>
            <td class="px-3 py-3"><AdminStatusBadge :status="r.status" kind="request" /></td>
            <td class="px-3 py-3 text-right"><UiIcon name="chevron-right" :size="16" class="text-muted" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="result" class="mt-5"><UiPagination :page="result.page" :pages="result.pages" @change="(p) => { q.page = p; load(); }" /></div>
  </div>
</template>
