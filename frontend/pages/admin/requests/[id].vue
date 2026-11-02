<script setup lang="ts">
import type { RepairRequest, RequestStatus } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const route = useRoute();
const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const id = String(route.params.id);
const item = ref<RepairRequest | null>(null);
const loading = ref(true);
const error = ref('');
const note = ref('');
const preview = ref<string | null>(null);
const statuses = Object.keys(requestStatusLabel) as RequestStatus[];

async function load() {
  loading.value = true;
  error.value = '';
  try {
    item.value = await request<RepairRequest>(`/admin/requests/${id}`);
    note.value = item.value.adminNote ?? '';
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function setStatus(status: RequestStatus) {
  if (!item.value || item.value.status === status) return;
  try {
    await request(`/admin/requests/${id}/status`, { method: 'PATCH', body: { status } });
    item.value.status = status;
    toast.success(`Կարգավիճակը փոխվեց՝ «${requestStatusLabel[status]}»`);
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
async function saveNote() {
  try {
    await request(`/admin/requests/${id}/note`, { method: 'PATCH', body: { adminNote: note.value } });
    toast.success('Նշումը պահպանվեց');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
async function archive() {
  if (!item.value) return;
  try {
    if (item.value.deletedAt) {
      await request(`/admin/requests/${id}/restore`, { method: 'POST' });
      toast.success('Հարցումը վերականգնվեց');
      return load();
    }
    if (!(await confirm({ title: 'Արխիվացնե՞լ հարցումը', message: 'Հարցումը կտեղափոխվի արխիվ։', confirmText: 'Արխիվացնել' }))) return;
    await request(`/admin/requests/${id}`, { method: 'DELETE' });
    toast.success('Հարցումը տեղափոխվեց արխիվ');
    await navigateTo('/admin/requests');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <UiSpinner v-if="loading" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <template v-else-if="item">
      <AdminPageHeader :title="`Հարցում ${item.requestNumber}`" :subtitle="`${requestSourceLabel[item.source]} · ${formatDate(item.createdAt, true)}`" back="/admin/requests">
        <a :href="telLink(item.phone)" class="btn-outline btn-sm"><UiIcon name="phone" :size="15" />Զանգել</a>
        <a :href="whatsappLink(item.phone, `Բարև Ձեզ, ${item.name}։ Գրում ենք Ձեր հարցման վերաբերյալ։`)" target="_blank" rel="noopener" class="btn-outline btn-sm"><UiIcon name="whatsapp" :size="15" />WhatsApp</a>
        <button type="button" class="btn-ghost btn-sm" @click="archive"><UiIcon :name="item.deletedAt ? 'refresh' : 'archive'" :size="15" />{{ item.deletedAt ? 'Վերականգնել' : 'Արխիվացնել' }}</button>
      </AdminPageHeader>

      <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div class="space-y-6">
          <AdminCard title="Հարցման մանրամասներ">
            <dl class="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt class="text-muted">Հաճախորդ</dt><dd class="font-medium">{{ item.name }}</dd></div>
              <div><dt class="text-muted">Հեռախոս</dt><dd><a :href="telLink(item.phone)" class="font-medium hover:underline">{{ formatPhone(item.phone) }}</a></dd></div>
              <div><dt class="text-muted">Ծառայության տեսակ</dt><dd>{{ item.serviceTitle || '—' }}</dd></div>
              <div><dt class="text-muted">Հասցե</dt><dd>{{ item.address || '—' }}</dd></div>
              <div class="sm:col-span-2"><dt class="text-muted">Նկարագրություն</dt><dd class="mt-1 whitespace-pre-line rounded-md bg-linen p-3">{{ item.description || '—' }}</dd></div>
            </dl>
          </AdminCard>
          <AdminCard :title="`Վերբեռնված նկարներ (${item.images?.length ?? 0})`">
            <p v-if="!item.images?.length" class="text-sm text-muted">Հաճախորդը նկարներ չի կցել։</p>
            <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button v-for="img in item.images" :key="img.id" type="button" class="overflow-hidden rounded-lg border border-line" @click="preview = img.url">
                <img :src="img.url" alt="Հաճախորդի կցած նկար" class="aspect-[4/3] w-full object-cover" loading="lazy" />
              </button>
            </div>
          </AdminCard>
          <AdminCard title="Ադմինի նշումներ">
            <textarea v-model="note" rows="4" class="input" maxlength="5000" placeholder="Գնահատված արժեք, պայմանավորվածություններ…" aria-label="Ադմինի նշումներ" />
            <div class="mt-3 flex justify-end"><button type="button" class="btn-primary btn-sm" @click="saveNote">Պահպանել նշումը</button></div>
          </AdminCard>
        </div>
        <AdminCard title="Կարգավիճակ" class="h-fit">
          <div class="grid gap-2">
            <button
              v-for="s in statuses"
              :key="s"
              type="button"
              class="flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition"
              :class="item.status === s ? 'border-espresso bg-espresso text-linen' : 'border-line hover:border-brass'"
              @click="setStatus(s)"
            >
              {{ requestStatusLabel[s] }}<UiIcon v-if="item.status === s" name="check" :size="16" />
            </button>
          </div>
        </AdminCard>
      </div>

      <UiModal :open="!!preview" title="Նկար" size="xl" @close="preview = null">
        <img v-if="preview" :src="preview" alt="Հաճախորդի կցած նկար" class="mx-auto max-h-[75vh] w-auto rounded" />
        <template #footer><a v-if="preview" :href="preview" target="_blank" rel="noopener" class="btn-outline btn-sm"><UiIcon name="external" :size="15" />Բացել նոր պատուհանում</a></template>
      </UiModal>
    </template>
  </div>
</template>
