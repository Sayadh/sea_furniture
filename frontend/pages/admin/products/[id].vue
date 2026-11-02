<script setup lang="ts">
import type { Availability, Category } from '~/types/api';
import type { ManagedImage } from '~/components/admin/ImageManager.vue';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const route = useRoute();
const { request } = useAdminApi();
const toast = useToast();
const { confirm } = useConfirm();
const id = computed(() => String(route.params.id));
const isNew = computed(() => id.value === 'new');

const categories = ref<Category[]>([]);
const loading = ref(true);
const loadError = ref('');
const saving = ref(false);
const errors = reactive<Record<string, string>>({});
const slugTouched = ref(false);
const uploading = ref(false);

const form = reactive({
  name: '', slug: '', categoryId: '', shortDescription: '', description: '',
  price: null as number | null, oldPrice: null as number | null, sku: '',
  dimensions: '', material: '', color: '', availability: 'IN_STOCK' as Availability, stockQuantity: 0, productionTime: '',
  isFeatured: false, isNew: false, isOnSale: false, isActive: true, isHeroSlide: false, sortOrder: null as number | null,
  seoTitle: '', seoDescription: '',
  images: [] as ManagedImage[],
});

onMounted(async () => {
  try {
    categories.value = await request<Category[]>('/admin/categories');
    if (!isNew.value) {
      const p = await request<Record<string, unknown> & { images: ManagedImage[] }>(`/admin/products/${id.value}`);
      for (const key of Object.keys(form) as (keyof typeof form)[]) {
        const v = p[key];
        if (v !== undefined) (form as Record<string, unknown>)[key] = v ?? (typeof form[key] === 'string' ? '' : v);
      }
      form.isHeroSlide = !!p.heroSlideAt;
      form.images = p.images.map((i) => ({ url: i.url, path: i.path, alt: i.alt ?? '', isMain: i.isMain }));
      slugTouched.value = true;
    } else if (categories.value[0]) {
      form.categoryId = typeof route.query.categoryId === 'string' ? route.query.categoryId : categories.value[0].id;
    }
  } catch (e) {
    loadError.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
});

watch(() => form.name, (n) => { if (!slugTouched.value) form.slug = slugify(n); });
watch(() => [form.oldPrice, form.price], () => {
  if (form.oldPrice && form.price && form.oldPrice > form.price) form.isOnSale = true;
});

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.name.trim().length < 2) errors.name = 'Նշեք ապրանքի անվանումը';
  if (!form.categoryId) errors.categoryId = 'Ընտրեք բաժինը';
  if (form.price === null || form.price === undefined || Number(form.price) < 0) errors.price = 'Նշեք գինը';
  if (form.oldPrice && form.price && Number(form.oldPrice) <= Number(form.price)) errors.oldPrice = 'Հին գինը պետք է մեծ լինի ընթացիկ գնից';
  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Միայն լատինատառ փոքրատառեր, թվեր և գծիկ';
  const first = Object.keys(errors)[0];
  if (first) document.getElementById(`p-${first}`)?.focus();
  return !first;
}

async function save() {
  if (!validate()) return;
  saving.value = true;
  const body = {
    ...form,
    slug: form.slug || undefined,
    price: Number(form.price),
    oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
    stockQuantity: Number(form.stockQuantity) || 0,
    sortOrder: form.sortOrder ?? undefined,
    images: form.images.map((i) => ({ url: i.url, path: i.path ?? undefined, alt: i.alt || undefined, isMain: !!i.isMain })),
  };
  try {
    if (isNew.value) {
      const created = await request<{ id: string }>('/admin/products', { method: 'POST', body });
      toast.success('Ապրանքը ավելացվեց');
      await navigateTo(`/admin/products/${created.id}`, { replace: true });
    } else {
      await request(`/admin/products/${id.value}`, { method: 'PATCH', body });
      toast.success('Փոփոխությունները պահպանվեցին');
    }
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    saving.value = false;
  }
}

async function remove() {
  if (!(await confirm({ title: 'Ջնջե՞լ ապրանքը', message: 'Ապրանքը կհեռացվի կատալոգից։ Հին պատվերներում այն կպահպանվի։', confirmText: 'Ջնջել', danger: true }))) return;
  try {
    await request(`/admin/products/${id.value}`, { method: 'DELETE' });
    toast.success('Ապրանքը ջնջվեց');
    await navigateTo('/admin/products');
  } catch (e) {
    toast.error(apiErrorMessage(e));
  }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="isNew ? 'Նոր ապրանք' : form.name || 'Ապրանք'" back="/admin/products">
      <a v-if="!isNew && form.slug" :href="`/products/${form.slug}`" target="_blank" class="btn-outline btn-sm"><UiIcon name="external" :size="15" />Դիտել կայքում</a>
      <button v-if="!isNew" type="button" class="btn-ghost btn-sm text-red-700" @click="remove"><UiIcon name="trash" :size="15" />Ջնջել</button>
      <button type="submit" form="product-form" class="btn-primary btn-sm"   :disabled="saving || loading || uploading"><UiIcon v-if="saving || uploading" name="spinner" :size="15" />{{ uploading ? 'Նկարը վերբեռնվում է…' : 'Պահպանել' }}</button>
    </AdminPageHeader>

    <UiSpinner v-if="loading" />
    <UiErrorState v-else-if="loadError" :message="loadError" @retry="$router.go(0)" />
    <UiEmptyState v-else-if="!categories.length" icon="folder" title="Նախ ստեղծեք բաժին" text="Ապրանք ավելացնելու համար անհրաժեշտ է առնվազն մեկ բաժին։">
      <NuxtLink to="/admin/categories" class="btn-primary">Բաժիններ</NuxtLink>
    </UiEmptyState>
    <form v-else id="product-form" class="grid gap-6 xl:grid-cols-[1fr_340px]" novalidate @submit.prevent="save">
      <div class="space-y-6">
        <AdminCard title="Հիմնական տվյալներ">
          <div class="grid gap-5">
            <AdminField label="Անվանում" for="p-name" required :error="errors.name"><input id="p-name" v-model="form.name" class="input" maxlength="200" /></AdminField>
            <div class="grid gap-5 sm:grid-cols-2">
              <AdminField label="Slug (URL)" for="p-slug" :error="errors.slug" :hint="`/products/${form.slug || '...'}`">
                <input id="p-slug" v-model="form.slug" class="input" maxlength="160" @input="slugTouched = true" />
              </AdminField>
              <AdminField label="Բաժին" for="p-categoryId" required :error="errors.categoryId">
                <select id="p-categoryId" v-model="form.categoryId" class="input">
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}{{ c.isActive ? '' : ' (անջատված)' }}</option>
                </select>
              </AdminField>
            </div>
            <AdminField label="Կարճ նկարագրություն" for="p-short" :error="errors.shortDescription" hint="Ցուցադրվում է ապրանքի քարտում (մինչև 500 նիշ)">
              <textarea id="p-short" v-model="form.shortDescription" rows="2" class="input" maxlength="500" />
            </AdminField>
            <AdminField label="Ամբողջական նկարագրություն" for="p-desc" :error="errors.description">
              <textarea id="p-desc" v-model="form.description" rows="7" class="input" maxlength="10000" />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="Նկարներ">
          <AdminImageManager v-model="form.images" v-model:busy="uploading" folder="products" :max="20" />
          <p class="mt-3 text-sm text-muted">Առաջին կամ «Գլխավոր» նշված նկարը ցուցադրվում է կատալոգում։ Հերթականությունը փոխեք սլաքներով։</p>
        </AdminCard>

        <AdminCard title="Բնութագրեր">
          <div class="grid gap-5 sm:grid-cols-2">
            <AdminField label="Չափսեր" for="p-dim" :error="errors.dimensions"><input id="p-dim" v-model="form.dimensions" class="input" placeholder="220 × 92 × 85 սմ" maxlength="200" /></AdminField>
            <AdminField label="Ապրանքի կոդ (SKU)" for="p-sku" :error="errors.sku"><input id="p-sku" v-model="form.sku" class="input" maxlength="64" /></AdminField>
            <AdminField label="Նյութ" for="p-mat" :error="errors.material"><input id="p-mat" v-model="form.material" class="input" maxlength="200" /></AdminField>
            <AdminField label="Գույն" for="p-color" :error="errors.color"><input id="p-color" v-model="form.color" class="input" maxlength="200" /></AdminField>
          </div>
        </AdminCard>

        <AdminCard title="SEO">
          <div class="grid gap-5">
            <AdminField label="SEO title" for="p-st" :error="errors.seoTitle" :hint="`${form.seoTitle.length}/160 · դատարկ թողնելու դեպքում կօգտագործվի անվանումը`"><input id="p-st" v-model="form.seoTitle" class="input" maxlength="160" /></AdminField>
            <AdminField label="SEO description" for="p-sd" :error="errors.seoDescription" :hint="`${form.seoDescription.length}/320`"><textarea id="p-sd" v-model="form.seoDescription" rows="2" class="input" maxlength="320" /></AdminField>
          </div>
        </AdminCard>
      </div>

      <div class="space-y-6">
        <AdminCard title="Գին">
          <div class="grid gap-5">
            <AdminField label="Գին, ֏" for="p-price" required :error="errors.price"><input id="p-price" v-model.number="form.price" type="number" min="0" step="1000" inputmode="numeric" class="input" /></AdminField>
            <AdminField label="Հին գին, ֏" for="p-oldPrice" :error="errors.oldPrice" hint="Լրացրեք զեղչ ցույց տալու համար"><input id="p-oldPrice" v-model.number="form.oldPrice" type="number" min="0" step="1000" inputmode="numeric" class="input" /></AdminField>
          </div>
        </AdminCard>

        <AdminCard title="Առկայություն">
          <div class="grid gap-5">
            <AdminField label="Կարգավիճակ" for="p-av">
              <select id="p-av" v-model="form.availability" class="input">
                <option value="IN_STOCK">Առկա է</option>
                <option value="MADE_TO_ORDER">Պատվերով</option>
                <option value="OUT_OF_STOCK">Առկա չէ</option>
              </select>
            </AdminField>
            <AdminField label="Քանակ պահեստում" for="p-qty" :error="errors.stockQuantity"><input id="p-qty" v-model.number="form.stockQuantity" type="number" min="0" class="input" /></AdminField>
            <AdminField label="Պատրաստման / առաքման ժամկետ" for="p-pt" :error="errors.productionTime"><input id="p-pt" v-model="form.productionTime" class="input" placeholder="14–21 աշխատանքային օր" maxlength="120" /></AdminField>
          </div>
        </AdminCard>

        <AdminCard title="Ցուցադրում">
          <div class="grid gap-4">
            <AdminToggle v-model="form.isActive" label="Ակտիվ (ցուցադրվում է կայքում)" />
            <AdminToggle v-model="form.isFeatured" label="Առաջարկվող ապրանք" />
            <AdminToggle v-model="form.isNew" label="Նորույթ" />
            <AdminToggle v-model="form.isOnSale" label="Զեղչված" />
            <div>
              <AdminToggle v-model="form.isHeroSlide" label="Գլխավոր էջի սլայդերում" />
              <p class="mt-1 pl-14 text-sm text-muted">Մինչև 10 ապրանք։ Նորը ցուցադրվում է առաջինը, 11-րդն ավելացնելիս ամենահինը դուրս է գալիս։</p>
            </div>
            <AdminField label="Ցուցադրման հերթականություն" for="p-sort" hint="Փոքր թիվը ցուցադրվում է առաջինը"><input id="p-sort" v-model.number="form.sortOrder" type="number" min="0" class="input" /></AdminField>
          </div>
        </AdminCard>
      </div>
    </form>
  </div>
</template>
