<script setup lang="ts">
const props = withDefaults(defineProps<{ open: boolean; title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>(), { size: 'md' });
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

function onKey(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === 'Escape') emit('close');
  if (e.key === 'Tab' && panel.value) {
    const focusables = panel.value.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!import.meta.client) return;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement;
      await nextTick();
      panel.value?.querySelector<HTMLElement>('[autofocus],input,select,textarea,button')?.focus();
    } else previouslyFocused?.focus?.();
  },
);
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-150" enter-from-class="opacity-0" leave-active-class="transition duration-100" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-end justify-center bg-espresso/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" @mousedown.self="emit('close')">
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-lift sm:rounded-2xl"
          :class="widths[size]"
        >
          <header v-if="title" class="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <h2 class="font-serif text-lg">{{ title }}</h2>
            <button type="button" class="rounded-md p-1.5 text-muted hover:bg-cream hover:text-ink" aria-label="Փակել" @click="emit('close')">
              <UiIcon name="x" />
            </button>
          </header>
          <div class="overflow-y-auto px-5 py-5"><slot /></div>
          <footer v-if="$slots.footer" class="flex flex-wrap justify-end gap-2 border-t border-line bg-linen px-5 py-3">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
