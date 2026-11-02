import type { Category } from '~/types/api';

/** Active categories (shared across header, footer and catalog via a single cached request). */
export function useCategories() {
  const api = useApi();
  return useAsyncData('categories', () => api<Category[]>('/categories'), { default: () => [] as Category[] });
}
