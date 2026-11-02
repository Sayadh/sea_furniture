<script setup lang="ts">
useSeo({
  title: 'Կատալոգ — փափուկ կահույքի վաճառք',
  description: 'Փափուկ կահույքի վաճառք Երևանում․ բազմոցներ, բազկաթոռներ, աթոռներ, ննջասենյակի և պատվերով կահույք։ Ընտրեք ըստ գնի, առկայության և բաժնի։',
});
</script>

<template>
  <div class="container py-8 md:py-12">
    <UiBreadcrumbs :items="[{ name: 'Կատալոգ' }]" />
    <header class="mb-10 mt-6 max-w-2xl">
      <h1 class="text-h1">Փափուկ կահույքի տեսականի</h1>
      <p class="mt-3 text-lg text-muted">Բազմոցներ, բազկաթոռներ և աթոռներ՝ առկա և պատվերով։ Յուրաքանչյուր մոդել կարող ենք պատրաստել ձեր նախընտրած կտորով։</p>
    </header>
    <ProductCatalogView />
  </div>
</template>
