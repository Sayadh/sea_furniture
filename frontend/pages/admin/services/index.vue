<script setup lang="ts">
import type { Service } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

type Row = Service & { _count?: { repairRequests: number; portfolioItems: number } };
const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const items = ref<Row[]>([]);
const loading = ref(true);
const error = ref('');
const { move, saving } = useReorder(items, '/admin/services');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    items.value = await request<Row[]>('/admin/services');
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function toggle(s: Row) {
  try {
    await request(`/admin/services/${s.id}`, { method: 'PATCH', body: { isActive: !s.isActive } });
    s.isActive = !s.isActive;
    toast.success(s.isActive ? 'Ծառայությունը ակտիվացվեց' : 'Ծառայությունը անջատվեց');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
async function remove(s: Row) {
  if (!(await confirm({ title: 'Ջնջե՞լ ծառայությունը', message: `«${s.title}» ծառայությունը կջնջվի։ Առկա հարցումները կպահպանվեն։`, confirmText: 'Ջնջել', danger: true }))) return;
  try {
    await request(`/admin/services/${s.id}`, { method: 'DELETE' });
    toast.success('Ծառայությունը ջնջվեց');
    await load();
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Ծառայություններ" subtitle="Վերանորոգման և այլ ծառայություններ">
      <NuxtLink to="/admin/services/new" class="btn-primary btn-sm"><UiIcon name="plus" :size="16" />Ավելացնել ծառայություն</NuxtLink>
    </AdminPageHeader>
    <UiSpinner v-if="loading && !items.length" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!items.length" icon="wrench" title="Ծառայություններ դեռ չկան">
      <NuxtLink to="/admin/services/new" class="btn-primary">Ավելացնել ծառայություն</NuxtLink>
    </UiEmptyState>
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white">
      <table class="w-full min-w-[720px] text-sm">
        <thead class="border-b border-line bg-linen text-left text-sm text-muted">
          <tr><th class="w-10 px-3 py-3">Հերթ</th><th class="px-3 py-3">Ծառայություն</th><th class="px-3 py-3">Գին</th><th class="px-3 py-3">Ժամկետ</th><th class="px-3 py-3 text-center">Հարցումներ</th><th class="px-3 py-3">Ակտիվ</th><th class="px-3 py-3" /></tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="(s, i) in items" :key="s.id" class="hover:bg-linen/60">
            <td class="px-3 py-2"><AdminSortButtons :first="i === 0" :last="i === items.length - 1" :disabled="saving" @move="(d) => move(i, d)" /></td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-3">
                <img v-if="s.images[0]" :src="imageAt(s.images[0].url, 160)" alt="" class="h-10 w-14 rounded object-cover" />
                <NuxtLink :to="`/admin/services/${s.id}`" class="font-medium text-espresso hover:underline">{{ s.title }}</NuxtLink>
              </div>
            </td>
            <td class="px-3 py-2">{{ s.priceFrom ? `${formatPrice(s.priceFrom)}-ից` : 'Գնահատումից հետո' }}</td>
            <td class="px-3 py-2 text-muted">{{ s.duration }}</td>
            <td class="px-3 py-2 text-center">{{ s._count?.repairRequests ?? 0 }}</td>
            <td class="px-3 py-2"><AdminToggle :model-value="!!s.isActive" @update:model-value="toggle(s)" /></td>
            <td class="whitespace-nowrap px-3 py-2 text-right">
              <NuxtLink :to="`/admin/services/${s.id}`" class="btn-ghost btn-sm" aria-label="Խմբագրել"><UiIcon name="edit" :size="15" /></NuxtLink>
              <button type="button" class="btn-ghost btn-sm text-red-700" aria-label="Ջնջել" @click="remove(s)"><UiIcon name="trash" :size="15" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
