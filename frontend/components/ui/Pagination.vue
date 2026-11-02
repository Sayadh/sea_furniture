<script setup lang="ts">
const props = defineProps<{ page: number; pages: number }>();
const emit = defineEmits<{ change: [page: number] }>();
const list = computed(() => {
  const out: (number | '…')[] = [];
  for (let p = 1; p <= props.pages; p++) {
    if (p === 1 || p === props.pages || Math.abs(p - props.page) <= 1) out.push(p);
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
});
</script>

<template>
  <nav v-if="pages > 1" class="flex items-center justify-center gap-1" aria-label="Էջավորում">
    <button type="button" class="btn-ghost btn-sm" :disabled="page <= 1" aria-label="Նախորդ էջ" @click="emit('change', page - 1)">
      <UiIcon name="chevron-left" :size="16" />
    </button>
    <template v-for="(p, i) in list" :key="i">
      <span v-if="p === '…'" class="px-2 text-muted">…</span>
      <button
        v-else
        type="button"
        class="btn-sm min-w-[36px] rounded-md"
        :class="p === page ? 'bg-espresso text-linen' : 'hover:bg-cream'"
        :aria-current="p === page ? 'page' : undefined"
        @click="emit('change', p)"
      >
        {{ p }}
      </button>
    </template>
    <button type="button" class="btn-ghost btn-sm" :disabled="page >= pages" aria-label="Հաջորդ էջ" @click="emit('change', page + 1)">
      <UiIcon name="chevron-right" :size="16" />
    </button>
  </nav>
</template>
