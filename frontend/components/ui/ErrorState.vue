<script setup lang="ts">
defineProps<{ message?: string }>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="flex flex-col items-center rounded-card border border-red-200 bg-red-50/60 px-6 py-10 text-center">
    <p class="text-red-800">{{ message || 'Տվյալները բեռնել չհաջողվեց։' }}</p>
    <button type="button" class="btn-outline btn-sm mt-4" @click="emit('retry')">
      <UiIcon name="refresh" :size="16" /> Կրկին փորձել
    </button>
  </div>
</template>
