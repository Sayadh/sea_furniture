<script setup lang="ts">
defineProps<{ label: string; error?: string; hint?: string; required?: boolean; for?: string }>();
</script>

<template>
  <div>
    <label :for="$props.for" class="label">{{ label }}<span v-if="required" class="text-red-700"> *</span></label>
    <slot />
    <p v-if="error" class="field-error">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-muted">{{ hint }}</p>
  </div>
</template>
