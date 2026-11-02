<script setup lang="ts">
import type { UploadFolder } from '~/composables/useAdminUpload';

const props = defineProps<{ folder: UploadFolder; url: string | null | undefined; label?: string; contain?: boolean }>();
const emit = defineEmits<{ change: [value: { url: string | null; path: string | null }] }>();
const { upload, accept } = useAdminUpload();
const input = ref<HTMLInputElement | null>(null);
const busy = defineModel<boolean>('busy', { default: false });

async function onPick(e: Event) {
  const el = e.target as HTMLInputElement;
  const file = el.files?.[0];
  el.value = '';
  if (!file) return;
  busy.value = true;
  const res = await upload(file, props.folder);
  busy.value = false;
  if (res) emit('change', { url: res.url, path: res.path });
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-linen">
      <img v-if="url" :src="imageAt(url, 400)" :alt="label || ''" class="h-full w-full" :class="contain ? 'object-contain p-2' : 'object-cover'" />
      <UiIcon v-else name="image" :size="26" class="text-brass" />
    </div>
    <div class="flex flex-col gap-2">
      <button type="button" class="btn-outline btn-sm" :disabled="busy" @click="input?.click()">
        <UiIcon :name="busy ? 'spinner' : 'upload'" :size="15" />{{ url ? 'Փոխել' : 'Վերբեռնել' }}
      </button>
      <button v-if="url" type="button" class="btn-ghost btn-sm text-red-700" @click="emit('change', { url: null, path: null })">Հեռացնել</button>
    </div>
    <input ref="input" type="file" :accept="accept" class="sr-only" :aria-label="label || 'Ընտրել նկար'" @change="onPick" />
  </div>
</template>
