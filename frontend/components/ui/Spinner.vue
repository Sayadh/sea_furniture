<template>
  <span class="inline-flex items-center gap-2 text-muted" role="status">
    <UiIcon name="spinner" :size="18" />
    <span class="text-sm"><slot>Բեռնվում է…</slot></span>
  </span>
</template>
