<script setup lang="ts">
import type { Faq, HeroSlide, PortfolioItem, ProductList, Service } from '~/types/api';

const api = useApi();
const settings = useSiteSettings();
const { data: categories } = await useCategories();

const [{ data: heroSlides }, { data: featured }, { data: fresh }, { data: services }, { data: portfolio }, { data: faqs }] = await Promise.all([
  useAsyncData('home:hero-slides', () => api<HeroSlide[]>('/products/hero-slides'), { default: () => [] as HeroSlide[] }),
  useAsyncData('home:featured', () => api<ProductList>('/products', { query: { featured: 'true', limit: 8 } })),
  useAsyncData('home:new', () => api<ProductList>('/products', { query: { isNew: 'true', sort: 'newest', limit: 4 } })),
  useAsyncData('services', () => api<Service[]>('/services'), { default: () => [] as Service[] }),
  useAsyncData('home:portfolio', () => api<PortfolioItem[]>('/portfolio', { query: { limit: 4 } }), { default: () => [] as PortfolioItem[] }),
  useAsyncData('faqs', () => api<Faq[]>('/faqs'), { default: () => [] as Faq[] }),
]);


const heroFacts = computed(() => [
  { icon: 'grid', value: String(categories.value.length), label: 'Բաժիններ' },
  { icon: 'scissors', value: String(services.value.length), label: 'Ծառայություններ' },
  { icon: 'shield', value: '2 տարի', label: 'Երաշխիք' },
]);

/**
 * Category mosaic. Mobile: first tile full width but one row high, the rest in 2 columns
 * (a tile left alone in the last row spans both). Desktop (md+): big first tile + mosaic, unchanged.
 */
function categoryTileClass(i: number, count: number) {
  const mobile = i === 0 || (i === count - 1 && (count - 1) % 2 === 1) ? 'col-span-2' : '';
  const desktop = i === 0 ? 'md:col-span-2 md:row-span-2' : i >= 3 && i <= 5 ? 'md:col-span-2' : 'md:col-span-1';
  return `${mobile} ${desktop}`;
}

const showcase = computed(() => portfolio.value.find((p) => p.images.some((i) => i.kind === 'BEFORE') && p.images.some((i) => i.kind === 'AFTER')));
const otherWorks = computed(() => portfolio.value.filter((p) => p.id !== showcase.value?.id).slice(0, 3));
const imgOf = (item: PortfolioItem, kind: 'BEFORE' | 'AFTER') => item.images.find((i) => i.kind === kind)?.url ?? item.images[0]?.url ?? '';

const advantages = [
  { icon: 'ruler', title: 'Ձեր չափսերով', text: 'Պատրաստում ենք կահույք հենց ձեր սենյակի համար՝ ձևից մինչև կտորի երանգ։' },
  { icon: 'shield', title: 'Երաշխիք մինչև 2 տարի', text: 'Երաշխավորում ենք կարկասը, մեխանիզմները և կարերի որակը։' },
  { icon: 'scissors', title: 'Սեփական արտադրամաս', text: 'Բոլոր աշխատանքները կատարում են մեր վարպետները՝ առանց միջնորդների։' },
  { icon: 'truck', title: 'Առաքում և տեղափոխում', text: 'Առաքում ենք ամբողջ Հայաստանում և վերցնում ենք կահույքը վերանորոգման։' },
];

useSeo({ title: null, description: settings.value?.seoDescription });
useLocalBusinessLd();
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.value.slice(0, 5).map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
}));
</script>

<template>
  <div>
    <!-- Hero: product slider + actions card (on top of the slider on desktop, below it on mobile) -->
    <section class="relative bg-espresso text-linen">
      <div v-if="heroSlides.length" class="h-[420px] sm:h-[520px] lg:h-[calc(100svh-72px)] lg:max-h-[780px] lg:min-h-[560px]">
        <HomeHeroSlider :slides="heroSlides" />
      </div>
      <div
        class="container"
        :class="heroSlides.length ? 'lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-12 lg:z-10' : 'lg:py-16'"
      >
        <div class="py-7 sm:py-9 lg:pointer-events-auto lg:max-w-[600px] lg:rounded-card lg:border lg:border-linen/10 lg:bg-espresso/75 lg:p-8 lg:shadow-lift lg:backdrop-blur-md">
          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/catalog" class="btn-brass px-7">Դիտել տեսականին</NuxtLink>
            <a href="#consultation" class="btn-light px-7">Պատվիրել խորհրդատվություն</a>
          </div>
          <!-- Key facts: hairline brass icon, warm-gradient serif number, letter-spaced label, soft gradient dividers -->
          <dl class="relative mt-6 grid max-w-xl grid-cols-[1fr_auto_1fr] pt-6">
            <span class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/45 to-transparent" aria-hidden="true" />
            <div v-for="(f, i) in heroFacts" :key="f.label" class="relative flex flex-col items-center gap-3 px-1.5 text-center sm:px-6">
              <span
                v-if="i > 0"
                class="pointer-events-none absolute inset-y-1 left-0 w-px bg-gradient-to-b from-transparent via-linen/20 to-transparent"
                aria-hidden="true"
              />
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-brass ring-1 ring-brass/40" aria-hidden="true">
                <UiIcon :name="f.icon" :size="16" />
              </span>
              <div class="flex flex-col-reverse">
                <dt class="mt-2 whitespace-nowrap text-sm leading-tight tracking-wide text-brass-light/65 sm:uppercase sm:tracking-[0.14em]">{{ f.label }}</dt>
                <dd class="bg-gradient-to-b from-linen via-linen to-brass-light bg-clip-text font-serif text-h2 leading-none text-transparent min-[360px]:whitespace-nowrap">
                  {{ f.value }}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section">
      <div class="container">
        <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div class="max-w-3xl">
            <h2 class="section-title">Կահույք ձեր տան յուրաքանչյուր անկյունի համար</h2>
            <p class="mt-3 max-w-xl text-muted">Հյուրասենյակից մինչև ննջասենյակ՝ փափուկ կահույք, որը ստեղծվում է հարմարավետ ապրելու համար։ Ընտրեք բաժինը և գտեք ձեր ոճին համապատասխանողը։</p>
          </div>
          <NuxtLink to="/catalog" class="inline-flex shrink-0 items-center gap-1 text-base font-medium text-walnut underline-offset-4 hover:underline">Բոլոր բաժինները<UiIcon name="chevron-right" :size="16" /></NuxtLink>
        </div>
        <div class="grid auto-rows-[170px] grid-cols-2 gap-3 md:auto-rows-[240px] md:grid-cols-4 md:gap-4">
          <NuxtLink
            v-for="(c, i) in categories.slice(0, 6)"
            :key="c.id"
            :to="`/catalog/${c.slug}`"
            class="group relative overflow-hidden rounded-card bg-cream"
            :class="categoryTileClass(i, Math.min(categories.length, 6))"
          >
            <UiImg :src="c.imageUrl" :alt="c.name" :sizes="i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'" img-class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/10 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
              <div>
                <h3 class="font-serif text-linen" :class="i === 0 ? 'text-h2' : 'text-lg'">{{ c.name }}</h3>
                <p class="mt-0.5 text-sm text-linen/70">{{ c._count?.products ?? 0 }} ապրանք</p>
              </div>
              <span class="hidden rounded-full bg-linen/90 p-2 text-espresso transition group-hover:bg-brass sm:block"><UiIcon name="chevron-right" :size="16" /></span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- New arrivals -->
    <section v-if="fresh?.items.length" class="pb-16 md:pb-24">
      <div class="container">
        <div class="mb-8 flex items-end justify-between gap-4">
          <h2 class="section-title">Նոր տեսականի</h2>
          <NuxtLink to="/catalog?sort=newest" class="text-base font-medium text-walnut underline-offset-4 hover:underline">Բոլոր նորույթները</NuxtLink>
        </div>
        <ProductGrid :products="fresh.items" />
      </div>
    </section>

    <!-- Repair -->
    <section class="bg-cream py-16 md:py-24">
      <div class="container grid items-center gap-12 lg:grid-cols-2">
        <div class="relative">
          <img
            src="/images/home-repair-1440.webp"
            srcset="/images/home-repair-800.webp 800w, /images/home-repair-1440.webp 1440w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Լուսավոր հյուրասենյակ՝ բաց երանգի փափուկ անկյունային բազմոցով"
            width="1440"
            height="1086"
            loading="lazy"
            decoding="async"
            class="aspect-[4/3] w-full rounded-card object-cover"
          />
          <!-- Mobile: card under the photo, slightly overlapping its edge (keeps the sofa visible). sm+: floats on the photo. -->
          <div class="relative mx-3 -mt-8 flex items-center gap-3 rounded-card border border-linen/10 bg-espresso/90 p-3.5 text-linen shadow-lift backdrop-blur-md sm:absolute sm:bottom-5 sm:right-5 sm:mx-0 sm:mt-0 sm:max-w-[380px] sm:p-4 lg:-bottom-6 lg:right-8">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass text-espresso" aria-hidden="true"><UiIcon name="photo" :size="20" /></span>
            <div>
              <p class="font-serif text-lg leading-tight">Անվճար գնահատում</p>
              <p class="mt-0.5 text-sm text-linen/75">Ուղարկեք լուսանկարը, և նախնական գինը կասենք նույն օրը։</p>
            </div>
          </div>
        </div>
        <div>
          <h2 class="section-title">Փափուկ կահույքի վերանորոգում</h2>
          <p class="mt-4 max-w-prose text-lg leading-relaxed text-ink/80">
            Հին բազմոցը կամ սիրելի բազկաթոռը կարող է ծառայել ևս տասնյակ տարիներ։ Կատարում ենք բազմոցի վերանորոգում, աթոռների վերանորոգում, վերապաստառում, սպունգի և կարկասի փոխարինում։
          </p>
          <ul class="mt-8 divide-y divide-brass/25 border-y border-brass/25">
            <li v-for="s in services.slice(0, 4)" :key="s.id">
              <NuxtLink :to="`/services/${s.slug}`" class="group flex items-center justify-between gap-4 py-4">
                <span class="font-serif text-lg text-espresso group-hover:text-walnut">{{ s.title }}</span>
                <span class="shrink-0 text-base text-muted">{{ s.priceFrom ? `${formatPrice(s.priceFrom)}-ից` : 'Գինը՝ գնահատումից հետո' }}</span>
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/services#repair-form" class="btn-primary">Պատվիրել վերանորոգում</NuxtLink>
            <NuxtLink to="/services" class="btn-outline">Բոլոր ծառայությունները</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section v-if="featured?.items.length" class="section">
      <div class="container">
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 class="section-title">Առաջարկվող ապրանքներ</h2>
            <p class="mt-2 text-muted">Մեր հաճախորդների ամենասիրված մոդելները։</p>
          </div>
        </div>
        <ProductGrid :products="featured.items" />
      </div>
    </section>

    <!-- Advantages -->
    <section class="border-y border-line bg-white py-14 md:py-20">
      <div class="container">
        <h2 class="section-title max-w-xl">Ինչու են մեզ ընտրում</h2>
        <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="a in advantages" :key="a.title">
            <span class="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-dashed border-brass text-brass"><UiIcon :name="a.icon" :size="22" /></span>
            <h3 class="mt-4 font-serif text-lg">{{ a.title }}</h3>
            <p class="mt-2 leading-relaxed text-muted">{{ a.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Works -->
    <section v-if="showcase" class="section">
      <div class="container">
        <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div class="max-w-xl">
            <h2 class="section-title">Մեր աշխատանքները</h2>
            <p class="mt-3 text-muted">Շարժեք սլաքը՝ տեսնելու կահույքը վերանորոգումից առաջ և հետո։</p>
          </div>
          <NuxtLink to="/portfolio" class="text-base font-medium text-walnut underline-offset-4 hover:underline">Բոլոր աշխատանքները</NuxtLink>
        </div>
        <div class="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <figure>
            <UiBeforeAfter :before="imgOf(showcase, 'BEFORE')" :after="imgOf(showcase, 'AFTER')" :alt="showcase.title" />
            <figcaption class="mt-4">
              <p class="font-serif text-lg text-espresso">{{ showcase.title }}</p>
              <p v-if="showcase.description" class="mt-1 text-muted">{{ showcase.description }}</p>
            </figcaption>
          </figure>
          <div class="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            <NuxtLink v-for="w in otherWorks" :key="w.id" to="/portfolio" class="group grid grid-cols-1 gap-3 lg:grid-cols-[140px_1fr] lg:items-center">
              <UiImg :src="imgOf(w, 'AFTER')" :alt="w.title" sizes="(min-width: 1024px) 140px, 33vw" img-class="aspect-[4/3] w-full rounded-lg object-cover" />
              <div>
                <p class="font-serif text-lg leading-snug text-espresso group-hover:text-walnut">{{ w.title }}</p>
                <p v-if="w.service" class="mt-1 text-sm text-muted">{{ w.service.title }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- SEO: the main «կահույք Երևանում» text; its heading is the page h1 -->
    <section class="section">
      <div class="container">
        <SeoContentBlock :content="homeSeo" heading="h1" :faq-ld="false" />
      </div>
    </section>

    <!-- FAQ -->
    <section v-if="faqs.length" class="bg-cream/60 py-16 md:py-24">
      <div class="container grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 class="section-title">Հաճախ տրվող հարցեր</h2>
          <p class="mt-3 max-w-sm text-muted">Չգտա՞ք պատասխանը։ Զանգահարեք կամ գրեք մեզ, և մենք կպատասխանենք մի քանի րոպեում։</p>
          <NuxtLink to="/faq" class="btn-outline mt-6">Բոլոր հարցերը</NuxtLink>
        </div>
        <UiFaqList :items="faqs.slice(0, 5)" />
      </div>
    </section>

    <!-- Consultation -->
    <section id="consultation" class="scroll-mt-20 bg-walnut py-16 text-linen md:py-24">
      <div class="container grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 class="font-serif text-h2 text-linen">Պատվիրեք խորհրդատվություն</h2>
          <p class="mt-4 max-w-md text-lg leading-relaxed text-linen/75">
            Թողեք ձեր հեռախոսահամարը․ կօգնենք ընտրել կահույք, կտոր կամ կգնահատենք վերանորոգման արժեքը։
          </p>
          <div class="mt-8 space-y-3 text-base">
            <a v-if="settings?.phone" :href="telLink(settings.phone)" class="flex items-center gap-3 hover:text-brass"><UiIcon name="phone" class="text-brass" />{{ formatPhone(settings.phone) }}</a>
            <a v-if="settings?.phone2" :href="telLink(settings.phone2)" class="flex items-center gap-3 hover:text-brass"><UiIcon name="phone" class="text-brass" />{{ formatPhone(settings.phone2) }}</a>
            <a v-if="settings?.whatsapp" :href="whatsappLink(settings.whatsapp)" target="_blank" rel="noopener" class="flex items-center gap-3 hover:text-brass"><UiIcon name="whatsapp" class="text-brass" />Գրել WhatsApp-ով</a>
            <p v-if="settings?.workingHours" class="flex items-center gap-3 text-linen/70"><UiIcon name="clock" class="text-brass" />{{ settings.workingHours }}</p>
          </div>
        </div>
        <div class="rounded-card border border-linen/10 bg-espresso/40 p-5 sm:p-8">
          <FormsContactForm source="CONSULTATION" :services="services" dark submit-label="Պատվիրել զանգ" />
        </div>
      </div>
    </section>
  </div>
</template>
