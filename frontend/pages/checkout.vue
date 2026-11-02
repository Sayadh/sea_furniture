<script setup lang="ts">
const cart = useCartStore();
const api = useApi();
const toast = useToast();
const settings = useSiteSettings();
const lastOrder = useState<{ orderNumber: string; totalAmount: number; itemsCount: number } | null>('last-order', () => null);

const form = reactive({
  firstName: '', lastName: '', phone: '', altPhone: '', region: 'Երևան', address: '', deliveryNotes: '', comment: '', website: '',
});
const errors = reactive<Record<string, string>>({});
const sending = ref(false);

onMounted(() => {
  cart.hydrate();
  if (!cart.items.length) navigateTo('/cart', { replace: true });
});

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.firstName.trim().length < 2) errors.firstName = 'Նշեք ձեր անունը';
  if (form.lastName.trim().length < 2) errors.lastName = 'Նշեք ձեր ազգանունը';
  if (!normalizePhone(form.phone)) errors.phone = 'Նշեք ճիշտ հեռախոսահամար, օրինակ՝ 077 123 456';
  if (form.altPhone && !normalizePhone(form.altPhone)) errors.altPhone = 'Հեռախոսահամարը սխալ է';
  if (!form.region) errors.region = 'Ընտրեք մարզը կամ քաղաքը';
  if (form.address.trim().length < 3) errors.address = 'Նշեք առաքման հասցեն';
  const first = Object.keys(errors)[0];
  if (first) document.getElementById(`co-${first}`)?.focus();
  return !first;
}

async function submit() {
  if (!validate()) return;
  sending.value = true;
  try {
    const res = await api<{ orderNumber: string; totalAmount: number; itemsCount: number }>('/orders', {
      method: 'POST',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        altPhone: form.altPhone || undefined,
        region: form.region,
        address: form.address,
        deliveryNotes: form.deliveryNotes || undefined,
        comment: form.comment || undefined,
        website: form.website || undefined,
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
    });
    lastOrder.value = res;
    cart.clear();
    await navigateTo({ path: '/order-success', query: { n: res.orderNumber } });
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e, 'Պատվերը ուղարկել չհաջողվեց։ Խնդրում ենք փորձել կրկին կամ զանգահարել մեզ'));
  } finally {
    sending.value = false;
  }
}

useSeo({ title: 'Պատվերի ձևակերպում', noindex: true });
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Զամբյուղ', path: '/cart' }, { name: 'Պատվերի ձևակերպում' }]" />
    <h1 class="mt-6 text-h1">Պատվերի ձևակերպում</h1>
    <p class="mt-2 text-muted">Պատվերն ստանալուց հետո մեր մենեջերը կզանգահարի ձեզ՝ մանրամասները և առաքման ժամը ճշտելու համար։</p>

    <ClientOnly>
      <form class="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]" novalidate @submit.prevent="submit">
        <div class="space-y-8">
          <fieldset class="grid gap-5 sm:grid-cols-2">
            <legend class="mb-4 font-serif text-lg">Կոնտակտային տվյալներ</legend>
            <div>
              <label for="co-firstName" class="label">Անուն *</label>
              <input id="co-firstName" v-model="form.firstName" class="input" :class="{ 'input-error': errors.firstName }" autocomplete="given-name" maxlength="80" :aria-invalid="!!errors.firstName" />
              <p v-if="errors.firstName" class="field-error">{{ errors.firstName }}</p>
            </div>
            <div>
              <label for="co-lastName" class="label">Ազգանուն *</label>
              <input id="co-lastName" v-model="form.lastName" class="input" :class="{ 'input-error': errors.lastName }" autocomplete="family-name" maxlength="80" :aria-invalid="!!errors.lastName" />
              <p v-if="errors.lastName" class="field-error">{{ errors.lastName }}</p>
            </div>
            <div>
              <label for="co-phone" class="label">Հեռախոսահամար *</label>
              <input id="co-phone" v-model="form.phone" type="tel" inputmode="tel" class="input" :class="{ 'input-error': errors.phone }" autocomplete="tel" placeholder="077 123 456" maxlength="20" :aria-invalid="!!errors.phone" />
              <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
            </div>
            <div>
              <label for="co-altPhone" class="label">Այլընտրանքային հեռախոսահամար</label>
              <input id="co-altPhone" v-model="form.altPhone" type="tel" inputmode="tel" class="input" :class="{ 'input-error': errors.altPhone }" placeholder="Ոչ պարտադիր" maxlength="20" :aria-invalid="!!errors.altPhone" />
              <p v-if="errors.altPhone" class="field-error">{{ errors.altPhone }}</p>
            </div>
          </fieldset>

          <fieldset class="grid gap-5 sm:grid-cols-2">
            <legend class="mb-4 font-serif text-lg">Առաքում</legend>
            <div>
              <label for="co-region" class="label">Մարզ կամ քաղաք *</label>
              <select id="co-region" v-model="form.region" class="input" :class="{ 'input-error': errors.region }">
                <option v-for="r in ARMENIAN_REGIONS" :key="r" :value="r">{{ r }}</option>
              </select>
              <p v-if="errors.region" class="field-error">{{ errors.region }}</p>
            </div>
            <div>
              <label for="co-address" class="label">Հասցե *</label>
              <input id="co-address" v-model="form.address" class="input" :class="{ 'input-error': errors.address }" autocomplete="street-address" maxlength="300" placeholder="Փողոց, շենք, բնակարան" :aria-invalid="!!errors.address" />
              <p v-if="errors.address" class="field-error">{{ errors.address }}</p>
            </div>
            <div class="sm:col-span-2">
              <label for="co-deliveryNotes" class="label">Առաքման նշումներ</label>
              <input id="co-deliveryNotes" v-model="form.deliveryNotes" class="input" maxlength="1000" placeholder="Օրինակ՝ 5-րդ հարկ, վերելակը փոքր է, զանգել 30 րոպե առաջ" />
            </div>
            <div class="sm:col-span-2">
              <label for="co-comment" class="label">Պատվերի մեկնաբանություն</label>
              <textarea id="co-comment" v-model="form.comment" rows="3" class="input" maxlength="2000" placeholder="Կտորի գույն, չափսեր կամ այլ ցանկություններ" />
            </div>
          </fieldset>
          <div class="hidden" aria-hidden="true"><label>Կայք<input v-model="form.website" tabindex="-1" autocomplete="off" /></label></div>
          <p v-if="settings?.deliveryInfo" class="stitch-box rounded-card bg-cream px-6 py-5 text-sm leading-relaxed text-ink/80">{{ settings.deliveryInfo }}</p>
        </div>

        <aside class="h-fit rounded-card bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <h2 class="font-serif text-lg">Ձեր պատվերը</h2>
          <ul class="mt-4 divide-y divide-line">
            <li v-for="i in cart.items" :key="i.productId" class="flex gap-3 py-3">
              <UiImg :src="i.image" :alt="i.name" sizes="64px" :width="128" :height="96" img-class="aspect-[4/3] w-16 shrink-0 rounded-md object-cover" />
              <div class="min-w-0 flex-1 text-sm">
                <p class="line-clamp-2 text-espresso">{{ i.name }}</p>
                <p class="text-muted">{{ i.quantity }} × {{ formatPrice(i.price) }}</p>
              </div>
              <span class="text-sm font-medium">{{ formatPrice(i.price * i.quantity) }}</span>
            </li>
          </ul>
          <div class="stitch my-4" aria-hidden="true" />
          <div class="flex items-baseline justify-between">
            <span class="font-medium">Ընդամենը</span>
            <span class="font-serif text-h2 text-espresso">{{ formatPrice(cart.total) }}</span>
          </div>
          <button type="submit" class="btn-primary mt-6 w-full" :disabled="sending || !cart.items.length">
            <UiIcon v-if="sending" name="spinner" :size="16" />{{ sending ? 'Ուղարկվում է…' : 'Հաստատել պատվերը' }}
          </button>
          <p class="mt-3 text-center text-sm text-muted">Վերջնական գինը կհաստատվի մենեջերի կողմից։ Վճարումը՝ ապրանքը ստանալիս։</p>
        </aside>
      </form>
      <template #fallback><div class="mt-8"><UiSpinner /></div></template>
    </ClientOnly>
  </div>
</template>
