<script setup lang="ts">
import type { Faq } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const items = ref<Faq[]>([]);
const loading = ref(true);
const error = ref('');
const { move, saving: reordering } = useReorder(items, '/admin/faqs');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    items.value = await request<Faq[]>('/admin/faqs');
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const editing = ref(false);
const form = reactive({ id: '', question: '', answer: '', isActive: true });
const errors = reactive<Record<string, string>>({});
const busy = ref(false);

function openForm(f?: Faq) {
  Object.assign(form, { id: '', question: '', answer: '', isActive: true }, f ?? {});
  Object.keys(errors).forEach((k) => delete errors[k]);
  editing.value = true;
}

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.question.trim().length < 3) errors.question = 'Գրեք հարցը';
  if (form.answer.trim().length < 3) errors.answer = 'Գրեք պատասխանը';
  if (Object.keys(errors).length) return;
  busy.value = true;
  const body = { question: form.question, answer: form.answer, isActive: form.isActive };
  try {
    if (form.id) await request(`/admin/faqs/${form.id}`, { method: 'PATCH', body });
    else await request('/admin/faqs', { method: 'POST', body });
    toast.success(form.id ? 'Հարցը պահպանվեց' : 'Հարցը ավելացվեց');
    editing.value = false;
    await load();
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    busy.value = false;
  }
}

async function toggle(f: Faq) {
  try {
    await request(`/admin/faqs/${f.id}`, { method: 'PATCH', body: { isActive: !f.isActive } });
    f.isActive = !f.isActive;
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}

async function remove(f: Faq) {
  if (!(await confirm({ title: 'Ջնջե՞լ հարցը', message: `«${f.question}»`, confirmText: 'Ջնջել', danger: true }))) return;
  try {
    await request(`/admin/faqs/${f.id}`, { method: 'DELETE' });
    toast.success('Հարցը ջնջվեց');
    await load();
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Հաճախ տրվող հարցեր" subtitle="Ցուցադրվում են գլխավոր էջում և «Հարցեր» էջում">
      <button type="button" class="btn-primary btn-sm" @click="openForm()"><UiIcon name="plus" :size="16" />Ավելացնել հարց</button>
    </AdminPageHeader>
    <UiSpinner v-if="loading && !items.length" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <UiEmptyState v-else-if="!items.length" icon="help" title="Հարցեր դեռ չկան"><button type="button" class="btn-primary" @click="openForm()">Ավելացնել հարց</button></UiEmptyState>
    <ul v-else class="divide-y divide-line rounded-xl border border-line bg-white">
      <li v-for="(f, i) in items" :key="f.id" class="flex items-start gap-3 p-4">
        <AdminSortButtons :first="i === 0" :last="i === items.length - 1" :disabled="reordering" @move="(d) => move(i, d)" />
        <div class="min-w-0 flex-1" :class="{ 'opacity-50': !f.isActive }">
          <p class="font-medium text-espresso">{{ f.question }}</p>
          <p class="mt-1 line-clamp-2 text-sm text-muted">{{ f.answer }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <AdminToggle :model-value="!!f.isActive" @update:model-value="toggle(f)" />
          <button type="button" class="btn-ghost btn-sm" aria-label="Խմբագրել" @click="openForm(f)"><UiIcon name="edit" :size="15" /></button>
          <button type="button" class="btn-ghost btn-sm text-red-700" aria-label="Ջնջել" @click="remove(f)"><UiIcon name="trash" :size="15" /></button>
        </div>
      </li>
    </ul>

    <UiModal :open="editing" :title="form.id ? 'Խմբագրել հարցը' : 'Նոր հարց'" @close="editing = false">
      <form id="faq-form" class="grid gap-5" novalidate @submit.prevent="save">
        <AdminField label="Հարց" for="f-q" required :error="errors.question"><input id="f-q" v-model="form.question" class="input" maxlength="500" /></AdminField>
        <AdminField label="Պատասխան" for="f-a" required :error="errors.answer"><textarea id="f-a" v-model="form.answer" rows="6" class="input" maxlength="5000" /></AdminField>
        <AdminToggle v-model="form.isActive" label="Ակտիվ" />
      </form>
      <template #footer>
        <button type="button" class="btn-ghost btn-sm" @click="editing = false">Չեղարկել</button>
        <button type="submit" form="faq-form" class="btn-primary btn-sm" :disabled="busy">Պահպանել</button>
      </template>
    </UiModal>
  </div>
</template>
