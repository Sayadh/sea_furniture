<script setup lang="ts">
import type { Service } from '~/types/api';

const props = withDefaults(defineProps<{ source?: 'CONTACT' | 'CONSULTATION'; services?: Service[]; dark?: boolean; submitLabel?: string }>(), {
  source: 'CONTACT',
  submitLabel: 'Ուղարկել',
});
const api = useApi();
const toast = useToast();

const form = reactive({ name: '', phone: '', message: '', serviceId: '', website: '' });
const errors = reactive<Record<string, string>>({});
const sending = ref(false);
const sent = ref<string | null>(null);

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.name.trim().length < 2) errors.name = 'Նշեք ձեր անունը';
  if (!normalizePhone(form.phone)) errors.phone = 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ 077 123 456';
  return !Object.keys(errors).length;
}

async function submit() {
  if (!validate()) return;
  sending.value = true;
  try {
    const res = await api<{ requestNumber: string }>('/requests/contact', {
      method: 'POST',
      body: {
        name: form.name,
        phone: form.phone,
        message: form.message || undefined,
        serviceId: form.serviceId || undefined,
        source: props.source,
        website: form.website || undefined,
      },
    });
    sent.value = res.requestNumber;
    Object.assign(form, { name: '', phone: '', message: '', serviceId: '' });
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div v-if="sent" class="rounded-card px-6 py-10 text-center" :class="dark ? 'bg-linen/5 text-linen' : 'bg-white'" role="status">
    <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brass text-espresso"><UiIcon name="check" /></span>
    <h3 class="mt-4 font-serif text-h2" :class="dark ? 'text-linen' : ''">Շնորհակալություն, հարցումն ընդունված է</h3>
    <p class="mt-2" :class="dark ? 'text-linen/70' : 'text-muted'">Հարցման համարը՝ <strong>{{ sent }}</strong>։ Մեր մասնագետը կզանգահարի ձեզ աշխատանքային ժամերին։</p>
    <button type="button" class="mt-6 underline underline-offset-4" @click="sent = null">Ուղարկել նոր հարցում</button>
  </div>
  <form v-else class="grid gap-4" novalidate @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="`cf-name-${source}`" class="label" :class="{ '!text-linen/80': dark }">Անուն *</label>
        <input :id="`cf-name-${source}`" v-model="form.name" class="input" :class="{ 'input-error': errors.name }" autocomplete="name" maxlength="100" :aria-invalid="!!errors.name" />
        <p v-if="errors.name" class="field-error" :class="{ '!text-red-300': dark }">{{ errors.name }}</p>
      </div>
      <div>
        <label :for="`cf-phone-${source}`" class="label" :class="{ '!text-linen/80': dark }">Հեռախոսահամար *</label>
        <input :id="`cf-phone-${source}`" v-model="form.phone" type="tel" inputmode="tel" class="input" :class="{ 'input-error': errors.phone }" autocomplete="tel" placeholder="077 123 456" maxlength="20" :aria-invalid="!!errors.phone" />
        <p v-if="errors.phone" class="field-error" :class="{ '!text-red-300': dark }">{{ errors.phone }}</p>
      </div>
    </div>
    <div v-if="services?.length">
      <label :for="`cf-service-${source}`" class="label" :class="{ '!text-linen/80': dark }">Ինչո՞վ կարող ենք օգնել</label>
      <select :id="`cf-service-${source}`" v-model="form.serviceId" class="input">
        <option value="">Կահույքի ընտրություն կամ գնում</option>
        <option v-for="s in services" :key="s.id" :value="s.id">{{ s.title }}</option>
      </select>
    </div>
    <div>
      <label :for="`cf-msg-${source}`" class="label" :class="{ '!text-linen/80': dark }">Հաղորդագրություն</label>
      <textarea :id="`cf-msg-${source}`" v-model="form.message" rows="4" class="input" maxlength="3000" placeholder="Օրինակ՝ ուզում եմ անկյունային բազմոց 280 սմ երկարությամբ" />
    </div>
    <!-- honeypot -->
    <div class="hidden" aria-hidden="true">
      <label>Կայք<input v-model="form.website" tabindex="-1" autocomplete="off" /></label>
    </div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button type="submit" :class="dark ? 'btn-brass' : 'btn-primary'" :disabled="sending">
        <UiIcon v-if="sending" name="spinner" :size="16" />{{ submitLabel }}
      </button>
      <p class="text-sm" :class="dark ? 'text-linen/60' : 'text-muted'">Կզանգահարենք ձեզ աշխատանքային ժամերին։</p>
    </div>
  </form>
</template>
