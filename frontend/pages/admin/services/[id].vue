<script setup lang="ts">
import type { ManagedImage } from '~/components/admin/ImageManager.vue';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const route = useRoute();
const { request } = useAdminApi();
const toast = useToast();
const id = String(route.params.id);
const isNew = id === 'new';
const loading = ref(!isNew);
const saving = ref(false);
const errors = reactive<Record<string, string>>({});
const slugTouched = ref(!isNew);
const uploading = ref(false);

const form = reactive({
  title: '', slug: '', shortDescription: '', description: '', priceFrom: null as number | null, duration: '',
  isActive: true, seoTitle: '', seoDescription: '', images: [] as ManagedImage[],
});

onMounted(async () => {
  if (isNew) return;
  try {
    const s = await request<Record<string, any>>(`/admin/services/${id}`);
    Object.assign(form, {
      title: s.title, slug: s.slug, shortDescription: s.shortDescription ?? '', description: s.description ?? '', priceFrom: s.priceFrom,
      duration: s.duration ?? '', isActive: s.isActive, seoTitle: s.seoTitle ?? '', seoDescription: s.seoDescription ?? '',
      images: s.images.map((i: ManagedImage) => ({ url: i.url, path: i.path, alt: i.alt ?? '', isMain: i.isMain })),
    });
  } catch (e) {
    toast.error(apiErrorMessage(e));
  } finally {
    loading.value = false;
  }
});
watch(() => form.title, (t) => { if (!slugTouched.value) form.slug = slugify(t); });

async function save() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (form.title.trim().length < 2) errors.title = 'Նշեք ծառայության անվանումը';
  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Միայն լատինատառ փոքրատառեր, թվեր և գծիկ';
  if (Object.keys(errors).length) return;
  saving.value = true;
  const body = {
    ...form,
    slug: form.slug || undefined,
    priceFrom: form.priceFrom === null || (form.priceFrom as unknown) === '' ? null : Number(form.priceFrom),
    images: form.images.map((i) => ({ url: i.url, path: i.path ?? undefined, alt: i.alt || undefined, isMain: !!i.isMain })),
  };
  try {
    if (isNew) {
      const created = await request<{ id: string }>('/admin/services', { method: 'POST', body });
      toast.success('Ծառայությունը ավելացվեց');
      await navigateTo(`/admin/services/${created.id}`, { replace: true });
    } else {
      await request(`/admin/services/${id}`, { method: 'PATCH', body });
      toast.success('Փոփոխությունները պահպանվեցին');
    }
  } catch (e) {
    Object.assign(errors, apiFieldErrors(e));
    toast.error(apiErrorMessage(e));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="isNew ? 'Նոր ծառայություն' : form.title || 'Ծառայություն'" back="/admin/services">
      <a v-if="!isNew && form.slug" :href="`/services/${form.slug}`" target="_blank" class="btn-outline btn-sm"><UiIcon name="external" :size="15" />Դիտել կայքում</a>
      <button type="submit" form="service-form" class="btn-primary btn-sm" :disabled="saving || loading || uploading"><UiIcon v-if="saving || uploading" name="spinner" :size="15" />Պահպանել</button>
    </AdminPageHeader>
    <UiSpinner v-if="loading" />
    <form v-else id="service-form" class="grid gap-6 xl:grid-cols-[1fr_340px]" novalidate @submit.prevent="save">
      <div class="space-y-6">
        <AdminCard title="Տվյալներ">
          <div class="grid gap-5">
            <AdminField label="Անվանում" for="s-title" required :error="errors.title"><input id="s-title" v-model="form.title" class="input" maxlength="200" /></AdminField>
            <AdminField label="Slug (URL)" for="s-slug" :error="errors.slug" :hint="`/services/${form.slug || '...'}`"><input id="s-slug" v-model="form.slug" class="input" maxlength="160" @input="slugTouched = true" /></AdminField>
            <AdminField label="Կարճ նկարագրություն" for="s-short" :error="errors.shortDescription"><textarea id="s-short" v-model="form.shortDescription" rows="2" class="input" maxlength="500" /></AdminField>
            <AdminField label="Ամբողջական նկարագրություն" for="s-desc" :error="errors.description"><textarea id="s-desc" v-model="form.description" rows="7" class="input" maxlength="10000" /></AdminField>
          </div>
        </AdminCard>
        <AdminCard title="Նկարներ"><AdminImageManager v-model="form.images" v-model:busy="uploading" folder="services" :max="12" /></AdminCard>
        <AdminCard title="SEO">
          <div class="grid gap-5">
            <AdminField label="SEO title" for="s-st" :error="errors.seoTitle"><input id="s-st" v-model="form.seoTitle" class="input" maxlength="160" /></AdminField>
            <AdminField label="SEO description" for="s-sd" :error="errors.seoDescription"><textarea id="s-sd" v-model="form.seoDescription" rows="2" class="input" maxlength="320" /></AdminField>
          </div>
        </AdminCard>
      </div>
      <div class="space-y-6">
        <AdminCard title="Գին և ժամկետ">
          <div class="grid gap-5">
            <AdminField label="Սկզբնական գին, ֏" for="s-price" :error="errors.priceFrom" hint="Դատարկ թողնելու դեպքում կցուցադրվի «Գինը՝ գնահատումից հետո»"><input id="s-price" v-model.number="form.priceFrom" type="number" min="0" step="1000" class="input" /></AdminField>
            <AdminField label="Աշխատանքի մոտավոր ժամկետ" for="s-dur" :error="errors.duration"><input id="s-dur" v-model="form.duration" class="input" placeholder="3–7 աշխատանքային օր" maxlength="120" /></AdminField>
          </div>
        </AdminCard>
        <AdminCard title="Ցուցադրում"><AdminToggle v-model="form.isActive" label="Ակտիվ (ցուցադրվում է կայքում)" /></AdminCard>
      </div>
    </form>
  </div>
</template>
