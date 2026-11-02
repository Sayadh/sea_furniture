/** Restores the cart from localStorage after hydration (avoids SSR/client markup mismatch). */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => useCartStore().hydrate());
});
