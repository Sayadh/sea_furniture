<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const route = useRoute();
const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const id = String(route.params.id);
const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref('');
const note = ref('');
const savingNote = ref(false);
const savingStatus = ref(false);
const statuses = Object.keys(orderStatusLabel) as OrderStatus[];

async function load() {
  loading.value = true;
  error.value = '';
  try {
    order.value = await request<Order>(`/admin/orders/${id}`);
    note.value = order.value.adminNote ?? '';
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function setStatus(status: OrderStatus) {
  if (!order.value || status === order.value.status) return;
  if (status === 'CANCELLED' && !(await confirm({ title: 'Չեղարկե՞լ պատվերը', message: `Պատվեր ${order.value.orderNumber}-ի կարգավիճակը կդառնա «Չեղարկված»։`, confirmText: 'Չեղարկել պատվերը', danger: true }))) return;
  savingStatus.value = true;
  try {
    await request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } });
    order.value.status = status;
    toast.success(`Կարգավիճակը փոխվեց՝ «${orderStatusLabel[status]}»`);
  } catch (e) {
    toast.error(apiErrorMessage(e));
  } finally {
    savingStatus.value = false;
  }
}

async function saveNote() {
  savingNote.value = true;
  try {
    await request(`/admin/orders/${id}/note`, { method: 'PATCH', body: { adminNote: note.value } });
    toast.success('Նշումը պահպանվեց');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  } finally {
    savingNote.value = false;
  }
}

async function archive() {
  if (!order.value) return;
  if (order.value.deletedAt) {
    await request(`/admin/orders/${id}/restore`, { method: 'POST' });
    toast.success('Պատվերը վերականգնվեց');
    return load();
  }
  if (!(await confirm({ title: 'Արխիվացնե՞լ պատվերը', message: 'Պատվերը կտեղափոխվի արխիվ։ Այն կարող եք վերականգնել ցանկացած պահի։', confirmText: 'Արխիվացնել' }))) return;
  try {
    await request(`/admin/orders/${id}`, { method: 'DELETE' });
    toast.success('Պատվերը տեղափոխվեց արխիվ');
    await navigateTo('/admin/orders');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <UiSpinner v-if="loading" />
    <UiErrorState v-else-if="error" :message="error" @retry="load" />
    <template v-else-if="order">
      <AdminPageHeader :title="`Պատվեր ${order.orderNumber}`" :subtitle="`Ստեղծվել է՝ ${formatDate(order.createdAt, true)}`" back="/admin/orders">
        <a :href="telLink(order.phone)" class="btn-outline btn-sm"><UiIcon name="phone" :size="15" />Զանգել</a>
        <a :href="whatsappLink(order.phone, `Բարև Ձեզ, ${order.firstName}։ Գրում ենք Ձեր ${order.orderNumber} պատվերի վերաբերյալ։`)" target="_blank" rel="noopener" class="btn-outline btn-sm"><UiIcon name="whatsapp" :size="15" />WhatsApp</a>
        <button type="button" class="btn-ghost btn-sm" @click="archive"><UiIcon :name="order.deletedAt ? 'refresh' : 'archive'" :size="15" />{{ order.deletedAt ? 'Վերականգնել' : 'Արխիվացնել' }}</button>
      </AdminPageHeader>

      <p v-if="order.deletedAt" class="mb-4 rounded-md bg-stone-100 px-4 py-2.5 text-sm text-stone-700">Պատվերը արխիվացված է {{ formatDate(order.deletedAt, true) }}</p>

      <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <AdminCard title="Ապրանքներ">
            <ul class="-my-3 divide-y divide-line">
              <li v-for="item in order.items" :key="item.id" class="flex items-center gap-4 py-3">
                <img v-if="item.imageUrl" :src="imageAt(item.imageUrl, 160)" alt="" class="h-14 w-20 shrink-0 rounded object-cover" />
                <div class="min-w-0 flex-1">
                  <a v-if="item.productId" :href="`/products/${item.productSlug}`" target="_blank" class="font-medium text-espresso hover:underline">{{ item.productName }}</a>
                  <span v-else class="font-medium text-espresso">{{ item.productName }}</span>
                  <p class="text-sm text-muted">{{ item.productSku ? `Կոդ՝ ${item.productSku} · ` : '' }}{{ item.quantity }} × {{ formatPrice(item.unitPrice) }}</p>
                </div>
                <span class="font-medium">{{ formatPrice(item.lineTotal) }}</span>
              </li>
            </ul>
            <div class="mt-5 flex items-baseline justify-between border-t border-line pt-4">
              <span class="text-muted">Ընդամենը ({{ order.itemsCount }} հատ)</span>
              <span class="font-serif text-h2">{{ formatPrice(order.totalAmount) }}</span>
            </div>
            <p class="mt-2 text-sm text-muted">Գները ֆիքսված են պատվերի պահին։</p>
          </AdminCard>

          <AdminCard title="Ներքին նշում">
            <textarea v-model="note" rows="4" class="input" maxlength="5000" placeholder="Օրինակ՝ հաճախորդը խնդրեց առաքել շաբաթ օրը" aria-label="Ներքին նշում" />
            <div class="mt-3 flex justify-end"><button type="button" class="btn-primary btn-sm" :disabled="savingNote" @click="saveNote">Պահպանել նշումը</button></div>
          </AdminCard>
        </div>

        <div class="space-y-6">
          <AdminCard title="Կարգավիճակ">
            <div class="grid gap-2">
              <button
                v-for="s in statuses"
                :key="s"
                type="button"
                class="flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition"
                :class="order.status === s ? 'border-espresso bg-espresso text-linen' : 'border-line hover:border-brass'"
                :disabled="savingStatus"
                @click="setStatus(s)"
              >
                {{ orderStatusLabel[s] }}<UiIcon v-if="order.status === s" name="check" :size="16" />
              </button>
            </div>
          </AdminCard>
          <AdminCard title="Հաճախորդ">
            <dl class="space-y-3 text-sm">
              <div><dt class="text-muted">Անուն, ազգանուն</dt><dd class="font-medium">{{ order.firstName }} {{ order.lastName }}</dd></div>
              <div><dt class="text-muted">Հեռախոս</dt><dd><a :href="telLink(order.phone)" class="font-medium hover:underline">{{ formatPhone(order.phone) }}</a></dd></div>
              <div v-if="order.altPhone"><dt class="text-muted">Այլընտրանքային հեռախոս</dt><dd><a :href="telLink(order.altPhone)" class="hover:underline">{{ formatPhone(order.altPhone) }}</a></dd></div>
              <div><dt class="text-muted">Մարզ / քաղաք</dt><dd>{{ order.region }}</dd></div>
              <div><dt class="text-muted">Հասցե</dt><dd>{{ order.address }}</dd></div>
              <div v-if="order.deliveryNotes"><dt class="text-muted">Առաքման նշումներ</dt><dd class="whitespace-pre-line">{{ order.deliveryNotes }}</dd></div>
              <div v-if="order.comment"><dt class="text-muted">Մեկնաբանություն</dt><dd class="whitespace-pre-line">{{ order.comment }}</dd></div>
            </dl>
          </AdminCard>
        </div>
      </div>
    </template>
  </div>
</template>
