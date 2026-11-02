<script setup lang="ts">
import type { Faq } from '~/types/api';
import type { SeoContent } from '~/utils/seoContent';

/**
 * Crawlable SEO text block: heading, paragraphs, internal links and an optional FAQ
 * (with FAQPage structured data). `heading="h1"` when the block carries the page's main keyword.
 */
const props = withDefaults(defineProps<{ content: SeoContent; heading?: 'h1' | 'h2'; faqLd?: boolean }>(), { heading: 'h2', faqLd: true });

const faqItems = computed<Faq[]>(() =>
  (props.content.faqs ?? []).map((f, i) => ({ id: `seo-faq-${i}`, question: f.q, answer: f.a }) as Faq),
);

useJsonLd(() =>
  props.faqLd && faqItems.value.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.value.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }
    : null,
);
</script>

<template>
  <div class="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
    <div>
      <component :is="heading" class="section-title">{{ content.title }}</component>
      <div class="stitch mt-5 w-24" aria-hidden="true" />
      <p v-for="(p, i) in content.intro" :key="`i${i}`" class="mt-5 max-w-prose text-base leading-relaxed text-ink/80">{{ p }}</p>
      <template v-for="s in content.sections" :key="s.h">
        <h3 class="mt-8 font-serif text-lg text-espresso">{{ s.h }}</h3>
        <p v-for="(p, i) in s.p" :key="`${s.h}${i}`" class="mt-2 max-w-prose text-base leading-relaxed text-ink/80">{{ p }}</p>
      </template>
      <nav v-if="content.links?.length" class="mt-8" aria-label="Օգտակար հղումներ">
        <ul class="flex flex-wrap gap-2">
          <li v-for="l in content.links" :key="l.to">
            <NuxtLink :to="l.to" class="inline-flex items-center gap-1 rounded-full border border-brass/30 px-3.5 py-1.5 text-sm text-walnut transition hover:border-brass hover:bg-cream">
              {{ l.label }}<UiIcon name="chevron-right" :size="14" />
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
    <div v-if="faqItems.length">
      <h3 class="mb-2 font-serif text-lg text-espresso">Հաճախ տրվող հարցեր</h3>
      <UiFaqList :items="faqItems" />
    </div>
  </div>
</template>
