<script setup lang="ts">
import type { ProductDetail } from '~/types/api';

const route = useRoute();
const api = useApi();
const config = useRuntimeConfig();
const settings = useSiteSettings();
const cart = useCartStore();
const toast = useToast();
const slug = String(route.params.slug);

const { data: product, error } = await useAsyncData(`product:${slug}`, () => api<ProductDetail>(`/products/${slug}`));
if (error.value || !product.value) {
  throw pageLoadError(error.value, 'Ապրանքը չի գտնվել');
}

const p = computed(() => product.value!);
const quantity = ref(1);
const canBuy = computed(() => p.value.availability !== 'OUT_OF_STOCK');
const productUrl = computed(() => `${config.public.siteUrl}/products/${p.value.slug}`);
const plainName = computed(() => p.value.name.replace(/[«»]/g, ''));

const specs = computed(() =>
  [
    { label: 'Չափսեր', value: p.value.dimensions },
    { label: 'Նյութ', value: p.value.material },
    { label: 'Գույն', value: p.value.color },
    { label: p.value.availability === 'MADE_TO_ORDER' ? 'Պատրաստման ժամկետ' : 'Առաքման ժամկետ', value: p.value.productionTime || (p.value.availability === 'IN_STOCK' ? '1–3 աշխատանքային օր' : null) },
    { label: 'Ապրանքի կոդ', value: p.value.sku },
  ].filter((s) => s.value),
);

function addToCart() {
  cart.add({ ...p.value, image: p.value.images[0]?.url ?? null }, quantity.value);
  toast.success(`«${plainName.value}» ավելացվեց զամբյուղ`);
}

onMounted(() => {
  api(`/products/${slug}/view`, { method: 'POST' }).catch(() => null);
});

/**
 * Meta description: the Admin SEO text (or short description), completed with price and delivery area
 * when it is too short for search results (< 110 chars), so every product gets a full ~150-char snippet.
 */
function productMetaDescription() {
  const base = (p.value.seoDescription || p.value.shortDescription || p.value.name).trim().replace(/[։.]?$/, '։');
  if (base.length >= 110) return base;
  const price = p.value.price > 0 ? ` Գինը՝ ${formatPrice(p.value.price)}։` : '';
  return `${base}${price} Առաքում Երևանում և ամբողջ Հայաստանում։`;
}

useSeo(() => ({
  title: p.value.seoTitle || plainName.value,
  description: productMetaDescription(),
  image: p.value.images[0]?.url,
  type: 'product',
}));

useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: plainName.value,
  description: p.value.shortDescription || p.value.description || undefined,
  sku: p.value.sku || undefined,
  image: p.value.images.map((i) => i.url),
  category: p.value.category.name,
  material: p.value.material || undefined,
  color: p.value.color || undefined,
  brand: { '@type': 'Brand', name: settings.value?.siteName || config.public.siteName },
  // An Offer without a real price is invalid for Google, so it is omitted when the price is not set
  offers: p.value.price > 0
    ? {
        '@type': 'Offer',
        url: productUrl.value,
        priceCurrency: 'AMD',
        price: p.value.price,
        availability:
          p.value.availability === 'IN_STOCK' ? 'https://schema.org/InStock'
          : p.value.availability === 'MADE_TO_ORDER' ? 'https://schema.org/PreOrder'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      }
    : undefined,
}));
</script>

<template>
  <div v-if="product">
    <div class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Կատալոգ', path: '/catalog' }, { name: p.category.name, path: `/catalog/${p.category.slug}` }, { name: plainName }]" />

      <div class="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <ProductGallery :images="p.images" :name="plainName" />

        <div>
          <div class="flex flex-wrap items-center gap-2">
            <UiAvailabilityBadge :value="p.availability" />
            <span v-if="p.isNew" class="badge bg-cream text-espresso">Նորույթ</span>
            <span v-if="p.price > 0 && p.oldPrice && p.oldPrice > p.price" class="badge bg-espresso text-linen">Զեղչ</span>
          </div>
          <h1 class="mt-4 text-h1">{{ p.name }}</h1>
          <p v-if="p.shortDescription" class="mt-3 text-lg leading-relaxed text-muted">{{ p.shortDescription }}</p>

          <div v-if="p.price > 0" class="mt-6"><UiPrice :price="p.price" :old-price="p.oldPrice" size="lg" /></div>

          <div class="mt-6 flex flex-wrap gap-3">
            <UiQuantityInput v-model="quantity" :max="99" />
            <button type="button" class="btn-primary flex-1 sm:flex-none sm:px-8" :disabled="!canBuy" @click="addToCart">
              <UiIcon name="cart" :size="18" />{{ canBuy ? 'Ավելացնել զամբյուղ' : 'Առկա չէ' }}
            </button>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <a :href="telLink(settings?.phone)" class="btn-outline"><UiIcon name="phone" :size="18" />Զանգահարել</a>
            <a :href="whatsappLink(settings?.whatsapp, `Բարև Ձեզ, հետաքրքրված եմ «${plainName}» ապրանքով՝ ${productUrl}`)" target="_blank" rel="noopener" class="btn-outline">
              <UiIcon name="whatsapp" :size="18" />WhatsApp
            </a>
          </div>

          <dl v-if="specs.length" class="mt-8 divide-y divide-line border-y border-line">
            <div v-for="s in specs" :key="s.label" class="grid grid-cols-[150px_1fr] gap-4 py-3 text-base">
              <dt class="text-muted">{{ s.label }}</dt>
              <dd class="text-espresso">{{ s.value }}</dd>
            </div>
          </dl>

          <div v-if="settings?.deliveryInfo" class="stitch-box mt-6 rounded-card bg-cream px-6 py-5">
            <p class="flex items-center gap-2 font-medium text-espresso"><UiIcon name="truck" :size="18" class="text-brass" />Առաքում և վճարում</p>
            <p class="mt-2 text-sm leading-relaxed text-ink/80">{{ settings.deliveryInfo }}</p>
          </div>
        </div>
      </div>

      <section v-if="p.description" class="mt-16 max-w-3xl">
        <h2 class="section-title">Նկարագրություն</h2>
        <div class="stitch mt-4 w-24" aria-hidden="true" />
        <p class="prose-text mt-6">{{ p.description }}</p>
      </section>
    </div>

    <section v-if="p.related.length" class="border-t border-line bg-cream/50 py-16">
      <div class="container">
        <div class="mb-8 flex items-end justify-between gap-4">
          <h2 class="section-title">Նմանատիպ ապրանքներ</h2>
          <NuxtLink :to="`/catalog/${p.category.slug}`" class="hidden text-base font-medium text-walnut underline-offset-4 hover:underline sm:inline">Ամբողջ բաժինը</NuxtLink>
        </div>
        <ProductGrid :products="p.related" />
      </div>
    </section>
  </div>
</template>
