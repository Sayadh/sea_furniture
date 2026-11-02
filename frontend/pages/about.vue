<script setup lang="ts">
useSeo({
  title: 'Մեր մասին',
  description: 'Sea Furniture — փափուկ կահույքի արտադրություն, վաճառք և վերանորոգում Երևանում։ Սեփական արտադրամաս, փորձառու վարպետներ և անհատական մոտեցում։',
});

const principles = [
  { title: 'Ազնիվ գին', text: 'Գինը հայտնում ենք նախքան աշխատանքը սկսելը և չենք փոխում այն ընթացքում։' },
  { title: 'Որակյալ նյութեր', text: 'Օգտագործում ենք չորացված փայտ, բարձր խտության սպունգ և դիմացկուն կտորներ։' },
  { title: 'Ճշգրիտ ժամկետներ', text: 'Պատվերը հանձնում ենք պայմանավորված օրը կամ ավելի շուտ։' },
  { title: 'Անհատական մոտեցում', text: 'Լսում ենք ձեր ցանկությունները և առաջարկում ենք լուծում ձեր տան և բյուջեի համար։' },
];
// Photos are editable in Admin → Կարգավորումներ; built-in placeholders until uploaded
const settings = useSiteSettings();
const team = computed(() => ([1, 2, 3] as const).map((n) => aboutImage(settings.value, n)));
</script>

<template>
  <div>
    <section class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Մեր մասին' }]" />
      <div class="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h1 class="text-h1">Ստեղծում ենք կահույք, որով ապրում են տարիներ</h1>
          <p class="prose-text mt-6">Sea Furniture-ը փափուկ կահույքի արտադրությամբ, վաճառքով և վերանորոգմամբ զբաղվող ընկերություն է Երևանում։ Մեր արտադրամասում պատրաստում ենք բազմոցներ, բազկաթոռներ և ննջասենյակի կահույք, կատարում ենք անհատական պատվերներ և վերականգնում ենք ցանկացած տարիքի ու ոճի կահույք։

Երեք տարվա ընթացքում պատրաստել և վերանորոգել ենք ավելի քան 1500 կահույք։ Արտադրության բոլոր փուլերը՝ կարկասից մինչև վերջին կարը, իրականացնում ենք մեր արտադրամասում, ինչը թույլ է տալիս լիարժեք վերահսկել որակը և տալ մինչև 2 տարի երաշխիք։</p>
        </div>
        <UiImg :src="team[0]!.src" :alt="team[0]!.alt" eager sizes="(min-width: 1024px) 45vw, 100vw" img-class="aspect-[4/3] w-full rounded-card object-cover" />
      </div>
    </section>

    <section class="border-y border-line bg-white py-14">
      <div class="container grid gap-8 text-center sm:grid-cols-3">
        <div><p class="font-serif text-h2 text-espresso">3</p><p class="mt-2 text-muted">տարվա փորձ պաստառագործության մեջ</p></div>
        <div><p class="font-serif text-h2 text-espresso">1500+</p><p class="mt-2 text-muted">վերանորոգված և պատրաստված կահույք</p></div>
        <div><p class="font-serif text-h2 text-espresso">2 տարի</p><p class="mt-2 text-muted">երաշխիք մեր աշխատանքի համար</p></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Աշխատանքի սկզբունքներ</h2>
        <div class="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          <div v-for="p in principles" :key="p.title" class="border-t-[1.5px] border-dashed border-brass/60 pt-5">
            <h3 class="font-serif text-lg">{{ p.title }}</h3>
            <p class="mt-2 leading-relaxed text-muted">{{ p.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-cream py-16 md:py-24">
      <div class="container grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 class="section-title">Որակի երաշխիք</h2>
          <p class="prose-text mt-5">Նոր կահույքի կարկասի և մեխանիզմների համար տրամադրում ենք մինչև 2 տարի երաշխիք, իսկ վերանորոգման աշխատանքների համար՝ մինչև 1 տարի։ Եթե երաշխիքային ժամկետում խնդիր առաջանա, այն կվերացնենք անվճար։</p>
          <h2 class="section-title mt-12">Անհատական մոտեցում</h2>
          <p class="prose-text mt-5">Մեր մասնագետը կարող է գալ ձեր տուն՝ կտորների նմուշներով, կչափագրի տարածքը և կօգնի ընտրել այն տարբերակը, որը լավագույնս կհամապատասխանի ձեր ինտերիերին։</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UiImg v-for="(t, i) in team.slice(1)" :key="i" :src="t.src" :alt="t.alt" sizes="(min-width: 1024px) 25vw, 50vw" :img-class="`w-full rounded-card object-cover ${i === 0 ? 'aspect-[3/4] mt-10' : 'aspect-[3/4]'}`" />
        </div>
      </div>
    </section>

    <section class="container py-16 text-center">
      <h2 class="section-title">Եկեք ծանոթանանք</h2>
      <p class="mx-auto mt-3 max-w-lg text-muted">Այցելեք մեր արտադրամաս կամ պատվիրեք մասնագետի այց ձեր տուն։</p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <NuxtLink to="/contact" class="btn-primary">Կոնտակտներ</NuxtLink>
        <NuxtLink to="/catalog" class="btn-outline">Դիտել տեսականին</NuxtLink>
      </div>
    </section>
  </div>
</template>
