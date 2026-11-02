/** Move an item up/down in a local list and persist the order via PUT {endpoint}/reorder. */
export function useReorder<T extends { id: string }>(list: Ref<T[]>, endpoint: string) {
  const { request } = useAdminApi();
  const toast = useToast();
  const saving = ref(false);

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= list.value.length || saving.value) return;
    const prev = [...list.value];
    const copy = [...list.value];
    [copy[index], copy[j]] = [copy[j]!, copy[index]!];
    list.value = copy;
    saving.value = true;
    try {
      await request(`${endpoint}/reorder`, { method: 'PUT', body: { ids: copy.map((i) => i.id) } });
    } catch (e) {
      list.value = prev;
      toast.error(apiErrorMessage(e, 'Հերթականությունը պահպանել չհաջողվեց'));
    } finally {
      saving.value = false;
    }
  }
  return { move, saving };
}
