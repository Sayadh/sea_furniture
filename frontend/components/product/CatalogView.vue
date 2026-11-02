<script setup lang="ts">
import type { Category, ProductCard, ProductList } from '~/types/api';

const props = defineProps<{ category?: Category | null }>();
const route = useRoute();
const router = useRouter();
const api = useApi();
const { data: categories } = await useCategories();

const PAGE_SIZE = 12;
const sortOptions = [
  { value: 'default', label: 'Առաջարկվող' },
  { value: 'newest', label: 'Նորերը սկզբում' },
  { value: 'price_asc', label: 'Գինը՝ աճման կարգով' },
  { value: 'price_desc', label: 'Գինը՝ նվազման կարգով' },
  { value: 'popular', label: 'Ամենադիտվածները' },
];

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const filters = computed(() => ({
  search: str(route.query.search),
  minPrice: str(route.query.minPrice),
  maxPrice: str(route.query.maxPrice),
  sort: str(route.query.sort) || 'default',
  inStock: route.query.inStock === '1',
}));

function buildQuery(page: number) {
  const f = filters.value;
  return {
    page,
    limit: PAGE_SIZE,
    category: props.category?.slug || undefined,
    search: f.search || undefined,
    minPrice: /^\d+$/.test(f.minPrice) ? f.minPrice : undefined,
    maxPrice: /^\d+$/.test(f.maxPrice) ? f.maxPrice : undefined,
    sort: f.sort !== 'default' ? f.sort : undefined,
    inStock: f.inStock ? 'true' : undefined,
  };
}

const key = computed(() => `catalog:${props.category?.slug ?? 'all'}:${JSON.stringify(filters.value)}`);
const { data, status, error, refresh } = await useAsyncData(key, () => api<ProductList>('/products', { query: buildQuery(1) }), {
  watch: [filters],
});

// "Show more" pages appended client-side
const extra = ref<ProductCard[]>([]);
const page = ref(1);
const loadingMore = ref(false);
watch(key, () => { extra.value = []; page.value = 1; });

const products = computed(() => [...(data.value?.items ?? []), ...extra.value]);
const total = computed(() => data.value?.total ?? 0);
const hasMore = computed(() => products.value.length < total.value);

async function loadMore() {
  loadingMore.value = true;
  try {
    const next = await api<ProductList>('/products', { query: buildQuery(page.value + 1) });
    extra.value.push(...next.items);
    page.value++;
  } catch (e) {
    useToast().error(apiErrorMessage(e));
  } finally {
    loadingMore.value = false;
  }
}

// Local form state (applied to the URL)
const form = reactive({ ...filters.value });
watch(filters, (f) => Object.assign(form, f));

function apply(patch: Partial<typeof form> = {}) {
  Object.assign(form, patch);
  const q: Record<string, string> = {};
  if (form.search.trim()) q.search = form.search.trim();
  if (form.minPrice) q.minPrice = String(form.minPrice).replace(/\D/g, '');
  if (form.maxPrice) q.maxPrice = String(form.maxPrice).replace(/\D/g, '');
  if (form.sort && form.sort !== 'default') q.sort = form.sort;
  if (form.inStock) q.inStock = '1';
  router.replace({ query: q });
}

let searchTimer: ReturnType<typeof setTimeout> | undefined;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => apply(), 400);
}

function reset() {
  router.replace({ query: {} });
}

const activeFilters = computed(() => !!(filters.value.search || filters.value.minPrice || filters.value.maxPrice || filters.value.inStock));
const filtersOpen = ref(false);
</script>

<template>
  <div class="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)]">
    <!-- Sidebar (desktop) -->
    <aside class="hidden lg:block">
      <div class="sticky top-24 space-y-8">
        <nav aria-label="Բաժիններ">
          <h2 class="mb-3 font-serif text-lg">Բաժիններ</h2>
          <ul class="space-y-1 text-base">
            <li>
              <NuxtLink to="/catalog" class="flex justify-between rounded-md px-3 py-2 hover:bg-cream" :class="!category ? 'bg-cream font-medium text-espresso' : 'text-ink/80'">
                Ամբողջ տեսականին
              </NuxtLink>
            </li>
            <li v-for="c in categories" :key="c.id">
              <NuxtLink
                :to="{ path: `/catalog/${c.slug}`, query: route.query }"
                class="flex justify-between rounded-md px-3 py-2 hover:bg-cream"
                :class="category?.slug === c.slug ? 'bg-cream font-medium text-espresso' : 'text-ink/80'"
              >
                {{ c.name }}<span class="text-sm text-muted">{{ c._count?.products ?? '' }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="stitch" aria-hidden="true" />
        <ProductCatalogFilters :form="form" :price-range="data?.priceRange" @apply="apply" @reset="reset" />
      </div>
    </aside>

    <div class="min-w-0">
      <!-- Toolbar -->
      <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="relative flex-1">
          <span class="sr-only">Որոնում</span>
          <UiIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input v-model="form.search" type="search" class="input pl-10" placeholder="Որոնել ապրանք, նյութ կամ կոդ" maxlength="100" @input="onSearchInput" @keydown.enter.prevent="apply()" />
        </label>
        <div class="flex gap-3">
          <label class="flex-1 sm:w-60 sm:flex-none">
            <span class="sr-only">Դասավորել</span>
            <select v-model="form.sort" class="input" @change="apply()">
              <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>
          <button type="button" class="btn-outline lg:hidden" @click="filtersOpen = true">
            <UiIcon name="filter" :size="17" /> Ֆիլտրեր<span v-if="activeFilters" class="h-2 w-2 rounded-full bg-brass" />
          </button>
        </div>
      </div>

      <!-- Mobile category chips -->
      <div class="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        <NuxtLink to="/catalog" class="badge shrink-0 px-3.5 py-2 text-sm" :class="!category ? 'bg-espresso text-linen' : 'bg-cream text-espresso'">Բոլորը</NuxtLink>
        <NuxtLink
          v-for="c in categories"
          :key="c.id"
          :to="`/catalog/${c.slug}`"
          class="badge shrink-0 px-3.5 py-2 text-sm"
          :class="category?.slug === c.slug ? 'bg-espresso text-linen' : 'bg-cream text-espresso'"
        >
          {{ c.name }}
        </NuxtLink>
      </div>

      <p class="mb-5 text-sm text-muted" aria-live="polite">
        <template v-if="status !== 'pending'">Գտնվել է {{ total }} ապրանք</template>
        <button v-if="activeFilters" type="button" class="ml-3 text-brass-dark underline underline-offset-4" @click="reset">Մաքրել ֆիլտրերը</button>
      </p>

      <ProductGridSkeleton v-if="status === 'pending' && !data" />
      <UiErrorState v-else-if="error" @retry="refresh()" />
      <UiEmptyState
        v-else-if="!products.length"
        icon="search"
        title="Ապրանքներ չեն գտնվել"
        text="Փորձեք փոխել որոնման բառը կամ ֆիլտրերը։ Կարող եք նաև պատվիրել կահույք ձեր չափսերով։"
      >
        <button v-if="activeFilters" type="button" class="btn-outline" @click="reset">Մաքրել ֆիլտրերը</button>
        <NuxtLink to="/contact" class="btn-primary">Պատվիրել խորհրդատվություն</NuxtLink>
      </UiEmptyState>
      <template v-else>
        <div :class="{ 'opacity-60 transition-opacity': status === 'pending' }">
          <ProductGrid :products="products" :eager-count="2" />
        </div>
        <div v-if="hasMore" class="mt-12 flex flex-col items-center gap-2">
          <button type="button" class="btn-outline min-w-[220px]" :disabled="loadingMore" @click="loadMore">
            <UiIcon v-if="loadingMore" name="spinner" :size="16" />Ցուցադրել ավելին
          </button>
          <span class="text-sm text-muted">Ցուցադրված է {{ products.length }}-ը {{ total }}-ից</span>
        </div>
      </template>
    </div>

    <UiModal :open="filtersOpen" title="Ֆիլտրեր" @close="filtersOpen = false">
      <ProductCatalogFilters :form="form" :price-range="data?.priceRange" @apply="(p) => { apply(p); filtersOpen = false; }" @reset="() => { reset(); filtersOpen = false; }" />
    </UiModal>
  </div>
</template>
