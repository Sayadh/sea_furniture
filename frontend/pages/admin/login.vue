<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: 'Մուտք ադմինկա', meta: [{ name: 'robots', content: 'noindex, nofollow' }] });

const auth = useAuthStore();
const route = useRoute();
const form = reactive({ email: '', password: '' });
const show = ref(false);
const error = ref('');
const loading = ref(false);

const redirectTo = computed(() => {
  const r = typeof route.query.redirect === 'string' ? route.query.redirect : '';
  return r.startsWith('/admin') && !r.startsWith('/admin/login') ? r : '/admin';
});

onMounted(async () => {
  if (auth.admin || (await auth.fetchMe())) navigateTo(redirectTo.value, { replace: true });
});

async function submit() {
  error.value = '';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) return (error.value = 'Նշեք ճիշտ էլ. փոստի հասցե');
  if (!form.password) return (error.value = 'Նշեք գաղտնաբառը');
  loading.value = true;
  try {
    await auth.login(form.email.trim(), form.password);
    await navigateTo(redirectTo.value, { replace: true });
  } catch (e) {
    error.value = apiErrorMessage(e, 'Մուտք գործել չհաջողվեց');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <div class="relative hidden bg-espresso lg:block">
      <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80&auto=format&fit=crop" alt="" class="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div class="absolute inset-6 rounded-xl border-[1.5px] border-dashed border-linen/30" />
      <div class="absolute bottom-14 left-14 right-14"><LayoutLogo light /></div>
    </div>
    <div class="flex items-center justify-center bg-linen px-4 py-12">
      <form class="w-full max-w-sm" novalidate @submit.prevent="submit">
        <div class="mb-8 lg:hidden"><LayoutLogo /></div>
        <h1 class="font-serif text-h1">Մուտք ադմինկա</h1>
        <p class="mt-2 text-muted">Մուտքագրեք ձեր էլ. փոստը և գաղտնաբառը։</p>
        <div class="mt-8 space-y-4">
          <div>
            <label for="email" class="label">Էլ. փոստ</label>
            <input id="email" v-model="form.email" type="email" class="input" autocomplete="username" required autofocus />
          </div>
          <div>
            <label for="password" class="label">Գաղտնաբառ</label>
            <div class="relative">
              <input id="password" v-model="form.password" :type="show ? 'text' : 'password'" class="input pr-11" autocomplete="current-password" required />
              <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-espresso" :aria-label="show ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'" @click="show = !show">
                <UiIcon :name="show ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
          </div>
          <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{{ error }}</p>
          <button type="submit" class="btn-primary w-full" :disabled="loading"><UiIcon v-if="loading" name="spinner" :size="16" />Մուտք գործել</button>
        </div>
        <NuxtLink to="/" class="mt-8 inline-flex items-center gap-1 text-sm text-muted hover:text-espresso"><UiIcon name="arrow-left" :size="15" />Վերադառնալ կայք</NuxtLink>
      </form>
    </div>
  </div>
</template>
