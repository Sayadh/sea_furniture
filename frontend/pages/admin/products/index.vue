<script setup lang="ts">
import type { Availability, Category, Paginated } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

interface Row {
  id: string; name: string; slug: string; sku: string | null; price: number; oldPrice: number | null; availability: Availability;
  stockQuantity: number; isActive: boolean; isFeatured: boolean; isNew: boolean; isOnSale: boolean; heroSlideAt: string | null; sortOrder: number; viewCount: number;
  createdAt: string; category: { id: string; name: string }; images: { url: string }[];
}

const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const route = useRoute();
const router = useRouter();

const categories = ref<Category[]>([]);
const result = ref<Paginated<Row> | null>(null);
const loading = ref(true);
const error = ref('');
const q = reactive({
  search: String(route.query.search ?? ''),
  categoryId: String(route.query.categoryId ?? ''),
  status: String(route.query.status ?? 'all'),
  page: Number(route.query.page ?? 1),
});
const rows = computed({ get: () => result.value?.items ?? [], set: (v) => result.value && (result.value.items = v) });
const { move, saving: reordering } = useReorder(rows, '/admin/products');

async function load() {
  loading.value = true;
  error.value = '';
  router.replace({ query: { ...(q.search && { search: q.search }), ...(q.categoryId && { categoryId: q.categoryId }), ...(q.status !== 'all' && { status: q.status }), ...(q.page > 1 && { page: String(q.page) }) } });
  try {
    result.value = await request<Paginated<Row>>('/admin/products', {
      query: { search: q.search || undefined, categoryId: q.categoryId || undefined, status: q.status, page: q.page, limit: 25 },
    });
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  categories.value = await request<Category[]>('/admin/categories').catch(() => []);
  await load();
});

let t: ReturnType<typeof setTimeout> | undefined;
watch(() => q.search, () => { clearTimeout(t); t = setTimeout(() => { q.page = 1; load(); }, 350); });
watch(() => [q.categoryId, q.status], () => { q.page = 1; load(); });

async function toggle(p: Row) {
  try {
    await request(`/admin/products/${p.id}`, { method: 'PATCH', body: { isActive: !p.isActive } });
    p.isActive = !p.isActive;
    toast.success(p.isActive ? 'Ապրանքը ցուցադրվում է կայքում' : 'Ապրանքը թաքցված է');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}

async function remove(p: Row) {
  if (!(await confirm({ title: 'Ջնջե՞լ ապրանքը', message: `«${p.name}» ապրանքը կհեռացվի կատալոգից։ Հին պատվերներում այն կպահպանվի։`, confirmText: 'Ջնջել', danger: true }))) return;
  try {
    await request(`/admin/products/${p.id}`, { method: 'DELETE' });
    toast.success('Ապրանքը ջնջվեց');
    await load();
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Ապրանքներ" :subtitle="result ? `Ընդամենը՝ ${result.total}` : undefined">
      <NuxtLink to="/admin/products/new" class="btn-primary btn-sm"><UiIcon name="plus" :size="16" />Ավելացնել ապրանք</NuxtLink>
    </AdminPageHeader>

    <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_220px_180px]">
      <label class="relative">
        <span class="sr-only">Որոնում</span>
        <UiIcon name="search" :size="17" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input v-model="q.search" type="search" class="input pl-9" placeholder="Անվանում, կոդ կամ slug" />
      </label>
      <select v-model="q.categoryId" class="input" aria-label="Բաժին">
        <option value="">Բոլոր բաժինները</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="q.status" class="input" aria-label="Կարգավիճակ">
        <option value="all">Բոլորը</option>
        <option value="active">Ակտիվ</option>
        <option value="hidden">Թաքցված</option>
      </select>
    </div>

    <UiErrorState v-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!loading && !rows.length" icon="box" title="Ապրանքներ չեն գտնվել" :text="q.search ? 'Փորձեք փոխել որոնման բառը։' : 'Ավելացրեք առաջին ապրանքը։'">
      <NuxtLink to="/admin/products/new" class="btn-primary">Ավելացնել ապրանք</NuxtLink>
    </UiEmptyState>
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white" :class="{ 'opacity-60': loading }">
      <table class="w-full min-w-[860px] text-sm">
        <thead class="border-b border-line bg-linen text-left text-sm text-muted">
          <tr><th class="w-10 px-3 py-3">Հերթ</th><th class="px-3 py-3">Ապրանք</th><th class="px-3 py-3">Բաժին</th><th class="px-3 py-3 text-right">Գին</th><th class="px-3 py-3">Առկայություն</th><th class="px-3 py-3 text-center"><UiIcon name="eye" :size="15" class="inline" /></th><th class="px-3 py-3">Ակտիվ</th><th class="px-3 py-3" /></tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="(p, i) in rows" :key="p.id" class="hover:bg-linen/60">
            <td class="px-3 py-2"><AdminSortButtons :first="i === 0" :last="i === rows.length - 1" :disabled="reordering || !!q.search || !!q.categoryId || q.status !== 'all'" @move="(d) => move(i, d)" /></td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-3">
                <img v-if="p.images[0]" :src="imageAt(p.images[0].url, 160)" alt="" class="h-11 w-14 shrink-0 rounded object-cover" />
                <span v-else class="flex h-11 w-14 shrink-0 items-center justify-center rounded bg-cream text-brass"><UiIcon name="image" :size="16" /></span>
                <div class="min-w-0">
                  <NuxtLink :to="`/admin/products/${p.id}`" class="font-medium text-espresso hover:underline">{{ p.name }}</NuxtLink>
                  <div class="flex flex-wrap gap-1 text-sm text-muted">
                    <span v-if="p.sku">{{ p.sku }}</span>
                    <span v-if="p.isFeatured" class="text-brass-dark">· Առաջարկվող</span>
                    <span v-if="p.isNew" class="text-brass-dark">· Նորույթ</span>
                    <span v-if="p.isOnSale" class="text-brass-dark">· Զեղչված</span>
                    <span v-if="p.heroSlideAt" class="text-brass-dark">· Սլայդեր</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-3 py-2 text-muted">{{ p.category.name }}</td>
            <td class="px-3 py-2 text-right"><div class="font-medium">{{ formatPrice(p.price) }}</div><s v-if="p.oldPrice" class="text-sm text-muted">{{ formatPrice(p.oldPrice) }}</s></td>
            <td class="px-3 py-2"><UiAvailabilityBadge :value="p.availability" /><div v-if="p.availability === 'IN_STOCK'" class="mt-1 text-sm text-muted">{{ p.stockQuantity }} հատ</div></td>
            <td class="px-3 py-2 text-center text-muted">{{ p.viewCount }}</td>
            <td class="px-3 py-2"><AdminToggle :model-value="p.isActive" @update:model-value="toggle(p)" /></td>
            <td class="whitespace-nowrap px-3 py-2 text-right">
              <a :href="`/products/${p.slug}`" target="_blank" class="btn-ghost btn-sm" aria-label="Դիտել կայքում"><UiIcon name="external" :size="15" /></a>
              <NuxtLink :to="`/admin/products/${p.id}`" class="btn-ghost btn-sm" aria-label="Խմբագրել"><UiIcon name="edit" :size="15" /></NuxtLink>
              <button type="button" class="btn-ghost btn-sm text-red-700" aria-label="Ջնջել" @click="remove(p)"><UiIcon name="trash" :size="15" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="result" class="mt-5"><UiPagination :page="result.page" :pages="result.pages" @change="(p) => { q.page = p; load(); }" /></div>
  </div>
</template>
