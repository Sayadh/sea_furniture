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
const team = [
  { src: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&q=80&auto=format&fit=crop', alt: 'Կտորի ձևավորում արտադրամասում' },
  { src: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80&auto=format&fit=crop', alt: 'Վարպետի գործիքներ' },
  { src: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200&q=80&auto=format&fit=crop', alt: 'Կտորների նմուշներ' },
];
</script>

<template>
  <div>
    <section class="container py-8 md:py-12">
      <UiBreadcrumbs :items="[{ name: 'Մեր մասին' }]" />
      <div class="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <h1 class="text-h1">Ստեղծում ենք կահույք, որով ապրում են տարիներ</h1>
          <p class="prose-text mt-6">Մենք սկսել ենք որպես փոքր պաստառագործական արտադրամաս, որտեղ վերանորոգում էինք հարևանների բազմոցներն ու աթոռները։ Այսօր մեր թիմը պատրաստում է նոր փափուկ կահույք, կատարում է պատվերներ անհատական չափսերով և վերականգնում է ամենատարբեր տարիքի ու ոճի կահույք։

Մեզ համար կարևոր է, որ յուրաքանչյուր բազմոց կամ բազկաթոռ լինի ոչ միայն գեղեցիկ, այլև ամուր ու հարմարավետ։ Այդ պատճառով բոլոր փուլերը՝ կարկասից մինչև վերջին կարը, կատարում ենք մեր արտադրամասում։</p>
        </div>
        <UiImg :src="team[0]?.src" :alt="team[0]!.alt" eager sizes="(min-width: 1024px) 45vw, 100vw" img-class="aspect-[4/3] w-full rounded-card object-cover" />
      </div>
    </section>

    <section class="border-y border-line bg-white py-14">
      <div class="container grid gap-8 text-center sm:grid-cols-3">
        <div><p class="font-serif text-h2 text-espresso">10+</p><p class="mt-2 text-muted">տարվա փորձ պաստառագործության մեջ</p></div>
        <div><p class="font-serif text-h2 text-espresso">3000+</p><p class="mt-2 text-muted">վերանորոգված և պատրաստված կահույք</p></div>
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
          <UiImg v-for="(t, i) in team.slice(1)" :key="t.src" :src="t.src" :alt="t.alt" sizes="(min-width: 1024px) 25vw, 50vw" :img-class="`w-full rounded-card object-cover ${i === 0 ? 'aspect-[3/4] mt-10' : 'aspect-[3/4]'}`" />
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
