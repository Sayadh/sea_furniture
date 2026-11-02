export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  const auth = useAuthStore();
  if (to.path === '/admin/login') return;
  if (!auth.admin) {
    const ok = await auth.fetchMe();
    if (!ok) return navigateTo({ path: '/admin/login', query: to.fullPath !== '/admin' ? { redirect: to.fullPath } : {} });
  }
});
