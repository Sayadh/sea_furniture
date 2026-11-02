<script setup lang="ts">
import type { ManagedImage } from '~/components/admin/ImageManager.vue';
import type { PortfolioImageKind, Service } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

interface Row {
  id: string; title: string; description: string | null; serviceId: string | null; isActive: boolean;
  service: { id: string; title: string } | null;
  images: { url: string; path: string | null; alt: string | null; kind: PortfolioImageKind }[];
}

const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const items = ref<Row[]>([]);
const services = ref<Service[]>([]);
const loading = ref(true);
const error = ref('');
const { move, saving: reordering } = useReorder(items, '/admin/portfolio');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    [items.value, services.value] = await Promise.all([request<Row[]>('/admin/portfolio'), request<Service[]>('/admin/services')]);
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const editing = ref(false);
const form = reactive({ id: '', title: '', description: '', serviceId: '', isActive: true, images: [] as ManagedImage[] });
const errors = reactive<Record<string, string>>({});
const busy = ref(false);
const uploading = ref(false);

function openForm(r?: Row) {
  Object.assign(form, { id: '', title: '', description: '', serviceId: '', isActive: true, images: [] });
  if (r) Object.assign(form, { id: r.id, title: r.title, description: r.description ?? '', serviceId: r.serviceId ?? '', isActive: r.isActive, images: r.images.map((i) => ({ ...i, alt: i.alt ?? '' })) });
  Object.keys(errors).forEach((k) => delete errors[k]);
  editing.value = true;
}

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.title.trim().length < 2) errors.title = 'Նշեք աշխատանքի անվանումը';
  if (!form.images.length) errors.images = 'Ավելացրեք առնվազն մեկ նկար («Մինչև» և «Հետո»)';
  if (Object.keys(errors).length) return;
  busy.value = true;
  const body = {
    title: form.title, description: form.description, serviceId: form.serviceId || null, isActive: form.isActive,
    images: form.images.map((i) => ({ url: i.url, path: i.path ?? undefined, alt: i.alt || undefined, kind: i.kind ?? 'GALLERY' })),
  };
  try {
    if (form.id) await request(`/admin/portfolio/${form.id}`, { method: 'PATCH', body });
    else await request('/admin/portfolio', { method: 'POST', body });
    toast.success('Աշխատանքը պահպանվեց');
    editing.value = false;
    await load();
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    busy.value = false;
  }
}

async function toggle(r: Row) {
  try {
    await request(`/admin/portfolio/${r.id}`, { method: 'PATCH', body: { isActive: !r.isActive } });
    r.isActive = !r.isActive;
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
async function remove(r: Row) {
  if (!(await confirm({ title: 'Ջնջե՞լ աշխատանքը', message: `«${r.title}» աշխատանքը և դրա նկարները կջնջվեն։`, confirmText: 'Ջնջել', danger: true }))) return;
  try {
    await request(`/admin/portfolio/${r.id}`, { method: 'DELETE' });
    toast.success('Աշխատանքը ջնջվեց');
    await load();
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
const img = (r: Row, kind: PortfolioImageKind) => r.images.find((i) => i.kind === kind)?.url ?? r.images[0]?.url;
</script>

<template>
  <div>
    <AdminPageHeader title="Մեր աշխատանքները" subtitle="«Մինչև» և «Հետո» լուսանկարներ">
      <button type="button" class="btn-primary btn-sm" @click="openForm()"><UiIcon name="plus" :size="16" />Ավելացնել աշխատանք</button>
    </AdminPageHeader>
    <UiSpinner v-if="loading && !items.length" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!items.length" icon="photo" title="Աշխատանքներ դեռ չկան"><button type="button" class="btn-primary" @click="openForm()">Ավելացնել աշխատանք</button></UiEmptyState>
    <ul v-else class="divide-y divide-line rounded-xl border border-line bg-white">
      <li v-for="(r, i) in items" :key="r.id" class="flex items-center gap-3 p-4">
        <AdminSortButtons :first="i === 0" :last="i === items.length - 1" :disabled="reordering" @move="(d) => move(i, d)" />
        <div class="flex shrink-0 gap-1">
          <img v-if="img(r, 'BEFORE')" :src="imageAt(img(r, 'BEFORE'), 160)" alt="Մինչև" class="h-12 w-16 rounded object-cover" />
          <img v-if="img(r, 'AFTER')" :src="imageAt(img(r, 'AFTER'), 160)" alt="Հետո" class="h-12 w-16 rounded object-cover" />
        </div>
        <div class="min-w-0 flex-1" :class="{ 'opacity-50': !r.isActive }">
          <p class="truncate font-medium text-espresso">{{ r.title }}</p>
          <p class="truncate text-sm text-muted">{{ r.service?.title ?? 'Առանց ծառայության' }} · {{ r.images.length }} նկար</p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <AdminToggle :model-value="r.isActive" @update:model-value="toggle(r)" />
          <button type="button" class="btn-ghost btn-sm" aria-label="Խմբագրել" @click="openForm(r)"><UiIcon name="edit" :size="15" /></button>
          <button type="button" class="btn-ghost btn-sm text-red-700" aria-label="Ջնջել" @click="remove(r)"><UiIcon name="trash" :size="15" /></button>
        </div>
      </li>
    </ul>

    <UiModal :open="editing" :title="form.id ? 'Խմբագրել աշխատանքը' : 'Նոր աշխատանք'" size="xl" @close="editing = false">
      <form id="portfolio-form" class="grid gap-5" novalidate @submit.prevent="save">
        <div class="grid gap-5 sm:grid-cols-2">
          <AdminField label="Անվանում" for="pf-title" required :error="errors.title"><input id="pf-title" v-model="form.title" class="input" maxlength="200" /></AdminField>
          <AdminField label="Ծառայության տեսակ" for="pf-service">
            <select id="pf-service" v-model="form.serviceId" class="input">
              <option value="">Առանց ծառայության</option>
              <option v-for="s in services" :key="s.id" :value="s.id">{{ s.title }}</option>
            </select>
          </AdminField>
        </div>
        <AdminField label="Կատարված աշխատանքի նկարագրություն" for="pf-desc" :error="errors.description"><textarea id="pf-desc" v-model="form.description" rows="3" class="input" maxlength="5000" /></AdminField>
        <AdminField label="Նկարներ" :error="errors.images" hint="Առաջին նկարը նշվում է «Մինչև», երկրորդը՝ «Հետո»։ Տեսակը կարող եք փոխել։">
          <AdminImageManager v-model="form.images" v-model:busy="uploading" folder="portfolio" :with-main="false" with-kind :max="20" />
        </AdminField>
        <AdminToggle v-model="form.isActive" label="Ակտիվ" />
      </form>
      <template #footer>
        <button type="button" class="btn-ghost btn-sm" @click="editing = false">Չեղարկել</button>
        <button type="submit" form="portfolio-form" class="btn-primary btn-sm" :disabled="busy || uploading">Պահպանել</button>
      </template>
    </UiModal>
  </div>
</template>
