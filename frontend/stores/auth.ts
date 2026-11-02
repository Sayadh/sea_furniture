import { defineStore } from 'pinia';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
}

export const useAuthStore = defineStore('auth', () => {
  const admin = ref<AdminProfile | null>(null);
  const checked = ref(false);

  async function fetchMe(): Promise<boolean> {
    const { request } = useAdminApi();
    try {
      const res = await request<{ admin: AdminProfile }>('/auth/me');
      admin.value = res.admin;
    } catch {
      admin.value = null;
    }
    checked.value = true;
    return !!admin.value;
  }

  async function login(email: string, password: string) {
    const { request } = useAdminApi();
    const res = await request<{ admin: AdminProfile }>('/auth/login', { method: 'POST', body: { email, password } });
    admin.value = res.admin;
    checked.value = true;
  }

  async function logout() {
    const { request } = useAdminApi();
    await request('/auth/logout', { method: 'POST' }).catch(() => null);
    admin.value = null;
  }

  return { admin, checked, fetchMe, login, logout };
});
