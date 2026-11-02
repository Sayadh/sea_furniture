<script setup lang="ts">
import type { Faq } from '~/types/api';

const api = useApi();
const settings = useSiteSettings();
const { data: faqs, error, refresh } = await useAsyncData('faqs', () => api<Faq[]>('/faqs'), { default: () => [] as Faq[] });

useSeo({
  title: 'Հաճախ տրվող հարցեր',
  description: 'Պատասխաններ փափուկ կահույքի գնման, առաքման, պատվերով կահույքի և կահույքի վերանորոգման վերաբերյալ հաճախ տրվող հարցերին։',
});
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.value.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
}));
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Հաճախ տրվող հարցեր' }]" />
    <div class="mt-6 grid gap-10 lg:grid-cols-[1fr_1.8fr]">
      <header>
        <h1 class="text-h1">Հաճախ տրվող հարցեր</h1>
        <p class="mt-3 text-lg text-muted">Չգտա՞ք ձեր հարցի պատասխանը։</p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <a :href="telLink(settings?.phone)" class="btn-primary"><UiIcon name="phone" :size="18" />Զանգահարել</a>
          <a :href="whatsappLink(settings?.whatsapp)" target="_blank" rel="noopener" class="btn-outline"><UiIcon name="whatsapp" :size="18" />Գրել WhatsApp-ով</a>
        </div>
      </header>
      <UiErrorState v-if="error" @retry="refresh()" />
      <UiEmptyState v-else-if="!faqs.length" icon="help" title="Հարցերը շուտով կավելացվեն" />
      <UiFaqList v-else :items="faqs" />
    </div>
  </div>
</template>
