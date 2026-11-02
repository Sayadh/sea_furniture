<script setup lang="ts">
const { toasts, dismiss } = useToast();
const icon = { success: 'check', error: 'x', info: 'help' } as const;
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6" aria-live="polite" role="status">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-lift"
        :class="t.type === 'error' ? 'border-red-200' : 'border-line'"
      >
        <span
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          :class="t.type === 'success' ? 'bg-emerald-100 text-emerald-700' : t.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-cream text-walnut'"
        >
          <UiIcon :name="icon[t.type]" :size="13" />
        </span>
        <p class="flex-1 text-ink">{{ t.message }}</p>
        <button type="button" class="text-muted hover:text-ink" aria-label="Փակել" @click="dismiss(t.id)">
          <UiIcon name="x" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
