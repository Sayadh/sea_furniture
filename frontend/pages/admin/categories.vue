<script setup lang="ts">
import type { Category } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();

const items = ref<Category[]>([]);
const loading = ref(true);
const error = ref('');
const { move, saving: reordering } = useReorder(items, '/admin/categories');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    items.value = await request<Category[]>('/admin/categories');
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const empty = () => ({ id: '', name: '', slug: '', description: '', imageUrl: null as string | null, imagePath: null as string | null, isActive: true, seoTitle: '', seoDescription: '' });
const form = reactive(empty());
const editing = ref(false);
const errors = reactive<Record<string, string>>({});
const busy = ref(false);
const uploading = ref(false);
const slugTouched = ref(false);

function openForm(c?: Category) {
  Object.assign(form, empty(), c ? { ...c, description: c.description ?? '', seoTitle: c.seoTitle ?? '', seoDescription: c.seoDescription ?? '' } : {});
  slugTouched.value = !!c;
  Object.keys(errors).forEach((k) => delete errors[k]);
  editing.value = true;
}
watch(() => form.name, (n) => { if (!slugTouched.value) form.slug = slugify(n); });

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.name.trim().length < 2) errors.name = 'Նշեք բաժնի անվանումը';
  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Միայն լատինատառ փոքրատառեր, թվեր և գծիկ';
  if (Object.keys(errors).length) return;
  busy.value = true;
  const body = {
    name: form.name, slug: form.slug || undefined, description: form.description, imageUrl: form.imageUrl, imagePath: form.imagePath,
    isActive: form.isActive, seoTitle: form.seoTitle, seoDescription: form.seoDescription,
  };
  try {
    if (form.id) await request(`/admin/categories/${form.id}`, { method: 'PATCH', body });
    else await request('/admin/categories', { method: 'POST', body });
    toast.success(form.id ? 'Բաժինը պահպանվեց' : 'Բաժինը ավելացվեց');
    editing.value = false;
    await load();
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    busy.value = false;
  }
}

async function toggle(c: Category) {
  try {
    await request(`/admin/categories/${c.id}`, { method: 'PATCH', body: { isActive: !c.isActive } });
    c.isActive = !c.isActive;
    toast.success(c.isActive ? 'Բաժինը ակտիվացվեց' : 'Բաժինը անջատվեց');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}

async function remove(c: Category) {
  const ok = await confirm({ title: 'Ջնջե՞լ բաժինը', message: `«${c.name}» բաժինը կջնջվի անվերադարձ։`, confirmText: 'Ջնջել', danger: true });
  if (!ok) return;
  try {
    await request(`/admin/categories/${c.id}`, { method: 'DELETE' });
    toast.success('Բաժինը ջնջվեց');
    await load();
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Բաժիններ" subtitle="Կատալոգի բաժինները և դրանց հերթականությունը">
      <button type="button" class="btn-primary btn-sm" @click="openForm()"><UiIcon name="plus" :size="16" />Ավելացնել բաժին</button>
    </AdminPageHeader>

    <UiSpinner v-if="loading && !items.length" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!items.length" icon="folder" title="Բաժիններ դեռ չկան" text="Ավելացրեք առաջին բաժինը, օրինակ՝ «Բազմոցներ»։">
      <button type="button" class="btn-primary" @click="openForm()">Ավելացնել բաժին</button>
    </UiEmptyState>
    <div v-else class="overflow-x-auto rounded-xl border border-line bg-white">
      <table class="w-full min-w-[680px] text-sm">
        <thead class="border-b border-line bg-linen text-left text-sm text-muted">
          <tr><th class="w-12 px-3 py-3">Հերթ</th><th class="px-3 py-3">Բաժին</th><th class="px-3 py-3">Slug</th><th class="px-3 py-3 text-center">Ապրանքներ</th><th class="px-3 py-3">Ակտիվ</th><th class="px-3 py-3 text-right">Գործողություններ</th></tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="(c, i) in items" :key="c.id" class="hover:bg-linen/60">
            <td class="px-3 py-2"><AdminSortButtons :first="i === 0" :last="i === items.length - 1" :disabled="reordering" @move="(d) => move(i, d)" /></td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-3">
                <img v-if="c.imageUrl" :src="imageAt(c.imageUrl, 160)" alt="" class="h-10 w-14 rounded object-cover" />
                <span v-else class="flex h-10 w-14 items-center justify-center rounded bg-cream text-brass"><UiIcon name="image" :size="16" /></span>
                <span class="font-medium text-espresso">{{ c.name }}</span>
              </div>
            </td>
            <td class="px-3 py-2 text-muted">{{ c.slug }}</td>
            <td class="px-3 py-2 text-center">{{ c._count?.products ?? 0 }}</td>
            <td class="px-3 py-2"><AdminToggle :model-value="!!c.isActive" @update:model-value="toggle(c)" /></td>
            <td class="px-3 py-2 text-right">
              <a :href="`/catalog/${c.slug}`" target="_blank" class="btn-ghost btn-sm" aria-label="Դիտել կայքում"><UiIcon name="external" :size="15" /></a>
              <button type="button" class="btn-ghost btn-sm" @click="openForm(c)"><UiIcon name="edit" :size="15" />Խմբագրել</button>
              <button type="button" class="btn-ghost btn-sm text-red-700" aria-label="Ջնջել" @click="remove(c)"><UiIcon name="trash" :size="15" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UiModal :open="editing" :title="form.id ? 'Խմբագրել բաժինը' : 'Նոր բաժին'" size="lg" @close="editing = false">
      <form id="category-form" class="grid gap-5" novalidate @submit.prevent="save">
        <div class="grid gap-5 sm:grid-cols-2">
          <AdminField label="Անվանում" for="c-name" required :error="errors.name"><input id="c-name" v-model="form.name" class="input" maxlength="120" /></AdminField>
          <AdminField label="Slug (URL)" for="c-slug" :error="errors.slug" hint="Ձևավորվում է ավտոմատ՝ անվանումից">
            <input id="c-slug" v-model="form.slug" class="input" maxlength="120" @input="slugTouched = true" />
          </AdminField>
        </div>
        <AdminField label="Նկարագրություն" for="c-desc" :error="errors.description"><textarea id="c-desc" v-model="form.description" rows="3" class="input" maxlength="2000" /></AdminField>
        <AdminField label="Նկար">
          <AdminSingleImage v-model:busy="uploading" folder="categories" :url="form.imageUrl" label="Բաժնի նկար" @change="(v) => { form.imageUrl = v.url; form.imagePath = v.path; }" />
        </AdminField>
        <div class="grid gap-5 sm:grid-cols-2">
          <AdminField label="SEO title" for="c-st" :error="errors.seoTitle"><input id="c-st" v-model="form.seoTitle" class="input" maxlength="160" /></AdminField>
          <AdminField label="SEO description" for="c-sd" :error="errors.seoDescription"><input id="c-sd" v-model="form.seoDescription" class="input" maxlength="320" /></AdminField>
        </div>
        <AdminToggle v-model="form.isActive" label="Ակտիվ (ցուցադրվում է կայքում)" />
      </form>
      <template #footer>
        <button type="button" class="btn-ghost btn-sm" @click="editing = false">Չեղարկել</button>
        <button type="submit" form="category-form" class="btn-primary btn-sm" :disabled="busy || uploading"><UiIcon v-if="busy" name="spinner" :size="15" />Պահպանել</button>
      </template>
    </UiModal>
  </div>
</template>
