<script setup lang="ts">
const { state, close } = useConfirm();
</script>

<template>
  <UiModal :open="state.open" :title="state.title" size="sm" @close="close(false)">
    <p class="text-ink/85">{{ state.message }}</p>
    <template #footer>
      <button type="button" class="btn-ghost btn-sm" @click="close(false)">Չեղարկել</button>
      <button type="button" :class="state.danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'" autofocus @click="close(true)">
        {{ state.confirmText }}
      </button>
    </template>
  </UiModal>
</template>
