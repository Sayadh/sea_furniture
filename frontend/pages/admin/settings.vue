<script setup lang="ts">
import type { SiteSettings } from '~/types/api';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const { request } = useAdminApi();
const toast = useToast();
const publicSettings = useSiteSettings();
const loading = ref(true);
const saving = ref(false);
const uploading = ref(false);
const errors = reactive<Record<string, string>>({});

const keys = [
  'siteName', 'logoUrl', 'logoPath', 'phone', 'phone2', 'whatsapp', 'address', 'workingHours', 'instagramUrl', 'tiktokUrl', 'facebookUrl',
  'mapEmbedUrl', 'heroTitle', 'heroSubtitle', 'heroImageUrl', 'heroImagePath', 'deliveryInfo', 'seoTitle', 'seoDescription',
] as const;
type Key = (typeof keys)[number];
const form = reactive(Object.fromEntries(keys.map((k) => [k, ''])) as Record<Key, string | null>);

onMounted(async () => {
  try {
    const s = await request<SiteSettings>('/admin/settings');
    for (const k of keys) form[k] = (s[k as keyof SiteSettings] as string | null) ?? '';
  } catch (e) {
    toast.error(apiErrorMessage(e));
  } finally {
    loading.value = false;
  }
});

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!form.siteName?.trim()) errors.siteName = 'Նշեք կայքի անվանումը';
  if (form.phone && !normalizePhone(form.phone)) errors.phone = 'Հեռախոսահամարը սխալ է';
  if (form.phone2 && !normalizePhone(form.phone2)) errors.phone2 = 'Հեռախոսահամարը սխալ է';
  if (form.whatsapp && !normalizePhone(form.whatsapp)) errors.whatsapp = 'Հեռախոսահամարը սխալ է';
  if (form.instagramUrl && !/^https:\/\/(www\.)?instagram\.com\//.test(form.instagramUrl)) errors.instagramUrl = 'Հղումը պետք է սկսվի https://www.instagram.com/';
  if (form.tiktokUrl && !/^https:\/\/(www\.|m\.)?tiktok\.com\//.test(form.tiktokUrl)) errors.tiktokUrl = 'Հղումը պետք է սկսվի https://www.tiktok.com/';
  if (form.facebookUrl && !/^https:\/\/(www\.|m\.)?(facebook\.com|fb\.com)\//.test(form.facebookUrl)) errors.facebookUrl = 'Հղումը պետք է սկսվի https://www.facebook.com/';
  if (form.mapEmbedUrl && !/^https:\/\/(www\.)?google\.[a-z.]+\/maps(\/embed|\?)/.test(form.mapEmbedUrl)) errors.mapEmbedUrl = 'Տեղադրեք Google Maps-ի «Embed a map» հղումը (src)';
  return !Object.keys(errors).length;
}

function extractMapSrc() {
  const m = /src="([^"]+)"/.exec(form.mapEmbedUrl ?? '');
  if (m?.[1]) form.mapEmbedUrl = m[1];
}

async function save() {
  if (!validate()) return;
  saving.value = true;
  try {
    const body = Object.fromEntries(keys.map((k) => [k, form[k] === '' && (k.endsWith('Url') || k.endsWith('Path')) ? null : form[k]]));
    const updated = await request<SiteSettings>('/admin/settings', { method: 'PUT', body });
    publicSettings.value = { ...publicSettings.value, ...updated } as SiteSettings;
    toast.success('Կարգավորումները պահպանվեցին');
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
    <AdminPageHeader title="Կայքի կարգավորումներ" subtitle="Կոնտակտներ, գլխավոր banner և SEO">
      <button type="submit" form="settings-form" class="btn-primary btn-sm" :disabled="saving || loading || uploading"><UiIcon v-if="saving" name="spinner" :size="15" />Պահպանել</button>
    </AdminPageHeader>
    <UiSpinner v-if="loading" />
    <form v-else id="settings-form" class="grid gap-6 xl:grid-cols-2" novalidate @submit.prevent="save">
      <AdminCard title="Ընդհանուր">
        <div class="grid gap-5">
          <AdminField label="Կայքի անվանում" for="st-name" required :error="errors.siteName"><input id="st-name" v-model="form.siteName" class="input" maxlength="100" /></AdminField>
          <AdminField label="Լոգո" hint="Խորհուրդ է տրվում PNG կամ WEBP՝ թափանցիկ ֆոնով">
            <AdminSingleImage v-model:busy="uploading" folder="settings" :url="form.logoUrl" label="Լոգո" contain @change="(v) => { form.logoUrl = v.url; form.logoPath = v.path; }" />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Կոնտակտներ">
        <div class="grid gap-5 sm:grid-cols-2">
          <AdminField label="Հեռախոսահամար" for="st-phone" :error="errors.phone" hint="Հիմնական՝ «Զանգել» կոճակների համար"><input id="st-phone" v-model="form.phone" type="tel" class="input" placeholder="077 123 456" /></AdminField>
          <AdminField label="Երկրորդ հեռախոսահամար" for="st-phone2" :error="errors.phone2"><input id="st-phone2" v-model="form.phone2" type="tel" class="input" placeholder="077 123 456" /></AdminField>
          <AdminField label="WhatsApp համար" for="st-wa" :error="errors.whatsapp"><input id="st-wa" v-model="form.whatsapp" type="tel" class="input" placeholder="077 123 456" /></AdminField>
          <AdminField label="Աշխատանքային ժամեր" for="st-hours" :error="errors.workingHours"><input id="st-hours" v-model="form.workingHours" class="input" maxlength="300" /></AdminField>
          <AdminField label="Հասցե" for="st-addr" class="sm:col-span-2" :error="errors.address"><input id="st-addr" v-model="form.address" class="input" maxlength="300" /></AdminField>
          <AdminField label="Instagram" for="st-ig" :error="errors.instagramUrl"><input id="st-ig" v-model="form.instagramUrl" class="input" placeholder="https://www.instagram.com/..." /></AdminField>
          <AdminField label="TikTok" for="st-tt" :error="errors.tiktokUrl"><input id="st-tt" v-model="form.tiktokUrl" class="input" placeholder="https://www.tiktok.com/@..." /></AdminField>
          <AdminField label="Facebook" for="st-fb" :error="errors.facebookUrl" hint="Դատարկ թողնելու դեպքում կայքում չի երևում"><input id="st-fb" v-model="form.facebookUrl" class="input" placeholder="https://www.facebook.com/..." /></AdminField>
          <AdminField label="Քարտեզ (Google Maps embed)" for="st-map" class="sm:col-span-2" :error="errors.mapEmbedUrl" hint="Google Maps → Share → Embed a map։ Կարող եք տեղադրել ամբողջ <iframe> կոդը։">
            <input id="st-map" v-model="form.mapEmbedUrl" class="input" @blur="extractMapSrc" />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Գլխավոր banner">
        <div class="grid gap-5">
          <AdminField label="Վերնագիր" for="st-ht" :error="errors.heroTitle"><input id="st-ht" v-model="form.heroTitle" class="input" maxlength="200" /></AdminField>
          <AdminField label="Ենթավերնագիր" for="st-hs" :error="errors.heroSubtitle"><textarea id="st-hs" v-model="form.heroSubtitle" rows="3" class="input" maxlength="500" /></AdminField>
          <AdminField label="Banner-ի նկար">
            <AdminSingleImage v-model:busy="uploading" folder="settings" :url="form.heroImageUrl" label="Banner" @change="(v) => { form.heroImageUrl = v.url; form.heroImagePath = v.path; }" />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Առաքում և SEO">
        <div class="grid gap-5">
          <AdminField label="Առաքման մասին տեղեկատվություն" for="st-del" :error="errors.deliveryInfo"><textarea id="st-del" v-model="form.deliveryInfo" rows="4" class="input" maxlength="3000" /></AdminField>
          <AdminField label="Ընդհանուր SEO title" for="st-seot" :error="errors.seoTitle" :hint="`${form.seoTitle?.length ?? 0}/160`"><input id="st-seot" v-model="form.seoTitle" class="input" maxlength="160" /></AdminField>
          <AdminField label="Ընդհանուր SEO description" for="st-seod" :error="errors.seoDescription" :hint="`${form.seoDescription?.length ?? 0}/320`"><textarea id="st-seod" v-model="form.seoDescription" rows="3" class="input" maxlength="320" /></AdminField>
        </div>
      </AdminCard>
    </form>
  </div>
</template>
