<script setup lang="ts">
import type { Service } from '~/types/api';

const props = defineProps<{ services: Service[]; preselect?: string }>();
const api = useApi();
const toast = useToast();

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const form = reactive({ name: '', phone: '', serviceId: props.preselect ?? '', address: '', description: '', website: '' });
const files = ref<{ file: File; preview: string }[]>([]);
const errors = reactive<Record<string, string>>({});
const sending = ref(false);
const sent = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

watch(() => props.preselect, (v) => { if (v) form.serviceId = v; });

function onFiles(e: Event) {
  const input = e.target as HTMLInputElement;
  delete errors.images;
  for (const file of Array.from(input.files ?? [])) {
    if (files.value.length >= MAX_FILES) { errors.images = `Կարող եք կցել առավելագույնը ${MAX_FILES} նկար`; break; }
    if (!ACCEPT.includes(file.type)) { errors.images = 'Թույլատրվում են միայն JPG, PNG, WEBP կամ AVIF նկարներ'; continue; }
    if (file.size > MAX_SIZE) { errors.images = `«${file.name}» ֆայլը 5 ՄԲ-ից մեծ է`; continue; }
    files.value.push({ file, preview: URL.createObjectURL(file) });
  }
  input.value = '';
}
function removeFile(i: number) {
  URL.revokeObjectURL(files.value[i]!.preview);
  files.value.splice(i, 1);
}
onBeforeUnmount(() => files.value.forEach((f) => URL.revokeObjectURL(f.preview)));

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.name.trim().length < 2) errors.name = 'Նշեք ձեր անունը';
  if (!normalizePhone(form.phone)) errors.phone = 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ 077 123 456';
  if (form.description.trim().length < 5) errors.description = 'Համառոտ նկարագրեք խնդիրը';
  return !Object.keys(errors).length;
}

async function submit() {
  if (!validate()) return;
  sending.value = true;
  const body = new FormData();
  body.append('name', form.name);
  body.append('phone', form.phone);
  body.append('description', form.description);
  if (form.serviceId) body.append('serviceId', form.serviceId);
  if (form.address) body.append('address', form.address);
  if (form.website) body.append('website', form.website);
  files.value.forEach((f) => body.append('images', f.file));
  try {
    const res = await api<{ requestNumber: string }>('/requests/repair', { method: 'POST', body });
    sent.value = res.requestNumber;
    files.value.forEach((f) => URL.revokeObjectURL(f.preview));
    files.value = [];
    Object.assign(form, { name: '', phone: '', address: '', description: '' });
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div v-if="sent" class="rounded-card bg-white px-6 py-12 text-center" role="status">
    <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brass text-espresso"><UiIcon name="check" /></span>
    <h3 class="mt-4 font-serif text-h2">Հարցումն ուղարկված է</h3>
    <p class="mx-auto mt-2 max-w-md text-muted">Հարցման համարը՝ <strong class="text-espresso">{{ sent }}</strong>։ Մեր վարպետը կուսումնասիրի այն և կզանգահարի ձեզ՝ գինը և ժամկետը ճշտելու համար։</p>
    <button type="button" class="btn-outline mt-6" @click="sent = null">Ուղարկել ևս մեկ հարցում</button>
  </div>

  <form v-else class="grid gap-5" novalidate @submit.prevent="submit">
    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label for="rr-name" class="label">Անուն *</label>
        <input id="rr-name" v-model="form.name" class="input" :class="{ 'input-error': errors.name }" autocomplete="name" maxlength="100" :aria-invalid="!!errors.name" />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>
      <div>
        <label for="rr-phone" class="label">Հեռախոսահամար *</label>
        <input id="rr-phone" v-model="form.phone" type="tel" inputmode="tel" class="input" :class="{ 'input-error': errors.phone }" autocomplete="tel" placeholder="077 123 456" maxlength="20" :aria-invalid="!!errors.phone" />
        <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
      </div>
      <div>
        <label for="rr-service" class="label">Ծառայության տեսակ</label>
        <select id="rr-service" v-model="form.serviceId" class="input">
          <option value="">Չգիտեմ, անհրաժեշտ է խորհրդատվություն</option>
          <option v-for="s in services" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
      </div>
      <div>
        <label for="rr-address" class="label">Հասցե</label>
        <input id="rr-address" v-model="form.address" class="input" autocomplete="street-address" maxlength="300" placeholder="Քաղաք, փողոց, շենք" />
      </div>
    </div>
    <div>
      <label for="rr-desc" class="label">Խնդրի նկարագրություն *</label>
      <textarea id="rr-desc" v-model="form.description" rows="4" class="input" :class="{ 'input-error': errors.description }" maxlength="3000" placeholder="Օրինակ՝ եռատեղ բազմոց, սպունգը նստել է, ուզում ենք փոխել կտորը" :aria-invalid="!!errors.description" />
      <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
    </div>

    <div>
      <span class="label">Կահույքի նկարներ <span class="font-normal text-muted">(մինչև 5 նկար, յուրաքանչյուրը մինչև 5 ՄԲ)</span></span>
      <div class="flex flex-wrap gap-3">
        <div v-for="(f, i) in files" :key="f.preview" class="relative h-24 w-24 overflow-hidden rounded-lg bg-cream">
          <img :src="f.preview" :alt="`Կցված նկար ${i + 1}`" class="h-full w-full object-cover" />
          <button type="button" class="absolute right-1 top-1 rounded-full bg-espresso/80 p-1 text-linen hover:bg-red-700" :aria-label="`Հեռացնել նկար ${i + 1}`" @click="removeFile(i)">
            <UiIcon name="x" :size="14" />
          </button>
        </div>
        <button
          v-if="files.length < MAX_FILES"
          type="button"
          class="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed border-brass/60 bg-white text-sm text-walnut hover:bg-cream"
          @click="fileInput?.click()"
        >
          <UiIcon name="photo" :size="22" class="text-brass" />Ավելացնել
        </button>
      </div>
      <input ref="fileInput" type="file" class="sr-only" :accept="ACCEPT.join(',')" multiple aria-label="Ընտրել նկարներ" @change="onFiles" />
      <p v-if="errors.images" class="field-error">{{ errors.images }}</p>
    </div>

    <div class="hidden" aria-hidden="true"><label>Կայք<input v-model="form.website" tabindex="-1" autocomplete="off" /></label></div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button type="submit" class="btn-primary px-8" :disabled="sending">
        <UiIcon v-if="sending" name="spinner" :size="16" />{{ sending ? 'Ուղարկվում է…' : 'Ուղարկել հարցումը' }}
      </button>
      <p class="text-sm text-muted">Նախնական գինը կասենք նկարներից, վերջնականը՝ զննումից հետո։</p>
    </div>
  </form>
</template>
