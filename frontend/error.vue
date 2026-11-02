<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const is404 = computed(() => props.error.statusCode === 404);
const isAdmin = computed(() => useRoute().path.startsWith('/admin'));

useHead({ title: is404.value ? 'Էջը չի գտնվել' : 'Սերվերի սխալ', meta: [{ name: 'robots', content: 'noindex' }] });
const handle = (to: string) => clearError({ redirect: to });
</script>

<template>
  <NuxtLayout :name="isAdmin ? false : 'default'">
    <div class="container flex min-h-[60vh] items-center justify-center py-20">
      <div class="max-w-lg text-center">
        <p class="font-serif text-h1 text-brass/70" style="font-stretch: 87.5%">{{ error.statusCode }}</p>
        <div class="stitch mx-auto my-6 w-24" aria-hidden="true" />
        <h1 class="text-h1">{{ is404 ? 'Էջը չի գտնվել' : 'Ինչ-որ բան այն չէ' }}</h1>
        <p class="mt-4 text-lg text-muted">
          {{ is404 ? 'Հնարավոր է՝ էջը տեղափոխվել է կամ հղումը սխալ է։ Փորձեք սկսել գլխավոր էջից կամ դիտել մեր տեսականին։' : 'Սերվերում տեղի ունեցավ սխալ։ Թարմացրեք էջը մի փոքր ուշ կամ զանգահարեք մեզ։' }}
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" class="btn-primary" @click="handle(isAdmin ? '/admin' : '/')">{{ isAdmin ? 'Վահանակ' : 'Գլխավոր էջ' }}</button>
          <button v-if="!isAdmin" type="button" class="btn-outline" @click="handle('/catalog')">Դիտել կատալոգը</button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
