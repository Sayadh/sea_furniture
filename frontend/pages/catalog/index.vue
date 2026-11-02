<script setup lang="ts">
useSeo({
  title: 'Փափուկ կահույք Երևանում — կատալոգ և գներ',
  description: 'Փափուկ կահույք Երևանում սեփական արտադրամասից․ բազմոցներ, անկյունային բազմոցներ, բազկաթոռներ, աթոռներ և պատվերով կահույք։ Առաքում ամբողջ Հայաստանում։',
});
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Կատալոգ' }]" />
    <header class="mb-10 mt-6 max-w-2xl">
      <h1 class="text-h1">Փափուկ կահույք Երևանում</h1>
      <p class="mt-3 text-lg text-muted">Բազմոցներ, բազկաթոռներ և աթոռներ՝ առկա և պատվերով։ Յուրաքանչյուր մոդել կարող ենք պատրաստել ձեր նախընտրած կտորով։</p>
    </header>
    <ProductCatalogView />
    <section class="mt-20 border-t border-line pt-14 md:mt-24">
      <SeoContentBlock :content="{ ...catalogSeo, title: 'Ինչու ընտրել մեր փափուկ կահույքը' }" />
    </section>
  </div>
</template>
