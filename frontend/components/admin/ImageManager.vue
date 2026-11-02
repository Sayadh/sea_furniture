<script setup lang="ts">
import type { UploadFolder } from '~/composables/useAdminUpload';

export interface ManagedImage {
  url: string;
  path?: string | null;
  alt?: string | null;
  isMain?: boolean;
  kind?: 'BEFORE' | 'AFTER' | 'GALLERY';
}

const props = withDefaults(defineProps<{ folder: UploadFolder; max?: number; withMain?: boolean; withKind?: boolean }>(), { max: 20, withMain: true, withKind: false });
const images = defineModel<ManagedImage[]>({ required: true });
const busy = defineModel<boolean>('busy', { default: false });
const { upload, accept } = useAdminUpload();
const input = ref<HTMLInputElement | null>(null);
const uploading = ref(0);
watch(uploading, (n) => (busy.value = n > 0));
const dragOver = ref(false);

const kindLabels = { BEFORE: 'Մինչև', AFTER: 'Հետո', GALLERY: 'Պատկերասրահ' } as const;

async function addFiles(list: FileList | File[]) {
  const files = Array.from(list).slice(0, Math.max(0, props.max - images.value.length));
  uploading.value += files.length;
  for (const file of files) {
    const res = await upload(file, props.folder);
    uploading.value--;
    if (!res) continue;
    const next: ManagedImage = { url: res.url, path: res.path, alt: '' };
    if (props.withMain) next.isMain = !images.value.some((i) => i.isMain);
    if (props.withKind) {
      const kinds = images.value.map((i) => i.kind);
      next.kind = !kinds.includes('BEFORE') ? 'BEFORE' : !kinds.includes('AFTER') ? 'AFTER' : 'GALLERY';
    }
    images.value = [...images.value, next];
  }
}

function onPick(e: Event) {
  const el = e.target as HTMLInputElement;
  if (el.files) addFiles(el.files);
  el.value = '';
}
function onDrop(e: DragEvent) {
  dragOver.value = false;
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
}
function move(i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= images.value.length) return;
  const copy = [...images.value];
  [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  images.value = copy;
}
function remove(i: number) {
  const copy = images.value.filter((_, idx) => idx !== i);
  if (props.withMain && images.value[i]?.isMain && copy[0]) copy[0] = { ...copy[0], isMain: true };
  images.value = copy;
}
function setMain(i: number) {
  images.value = images.value.map((img, idx) => ({ ...img, isMain: idx === i }));
}
function update(i: number, patch: Partial<ManagedImage>) {
  images.value = images.value.map((img, idx) => (idx === i ? { ...img, ...patch } : img));
}
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="(img, i) in images" :key="img.url" class="overflow-hidden rounded-lg border bg-white" :class="img.isMain ? 'border-brass ring-2 ring-brass/30' : 'border-line'">
        <div class="relative">
          <img :src="imageAt(img.url, 400)" :alt="img.alt || ''" class="aspect-[4/3] w-full object-cover" loading="lazy" />
          <span v-if="withMain && img.isMain" class="badge absolute left-2 top-2 bg-brass text-espresso">Գլխավոր</span>
          <span v-if="withKind && img.kind" class="badge absolute left-2 top-2 bg-espresso text-linen">{{ kindLabels[img.kind] }}</span>
          <button type="button" class="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-red-700 shadow hover:bg-red-50" aria-label="Ջնջել նկարը" @click="remove(i)">
            <UiIcon name="trash" :size="15" />
          </button>
        </div>
        <div class="space-y-2 p-2">
          <input :value="img.alt ?? ''" class="input !min-h-0 !py-1.5 text-sm" placeholder="Alt տեքստ (SEO)" maxlength="255" @input="update(i, { alt: ($event.target as HTMLInputElement).value })" />
          <select v-if="withKind" :value="img.kind" class="input !min-h-0 !py-1.5 text-sm" aria-label="Նկարի տեսակ" @change="update(i, { kind: ($event.target as HTMLSelectElement).value as ManagedImage['kind'] })">
            <option value="BEFORE">Մինչև</option>
            <option value="AFTER">Հետո</option>
            <option value="GALLERY">Պատկերասրահ</option>
          </select>
          <div class="flex items-center justify-between gap-1">
            <div class="flex">
              <button type="button" class="rounded p-1.5 text-muted hover:bg-cream disabled:opacity-30" :disabled="i === 0" aria-label="Տեղափոխել ձախ" @click="move(i, -1)"><UiIcon name="chevron-left" :size="16" /></button>
              <button type="button" class="rounded p-1.5 text-muted hover:bg-cream disabled:opacity-30" :disabled="i === images.length - 1" aria-label="Տեղափոխել աջ" @click="move(i, 1)"><UiIcon name="chevron-right" :size="16" /></button>
            </div>
            <button v-if="withMain && !img.isMain" type="button" class="rounded px-2 py-1 text-sm text-walnut hover:bg-cream" @click="setMain(i)">Դարձնել գլխավոր</button>
          </div>
        </div>
      </div>

      <button
        v-if="images.length < max"
        type="button"
        class="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition"
        :class="dragOver ? 'border-brass bg-brass-light/30' : 'border-line bg-linen hover:border-brass'"
        @click="input?.click()"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
      >
        <UiIcon :name="uploading ? 'spinner' : 'upload'" :size="22" class="text-brass" />
        <span class="text-walnut">{{ uploading ? `Վերբեռնվում է (${uploading})…` : 'Ավելացնել նկար' }}</span>
        <span class="text-sm text-muted">JPG, PNG, WEBP · մինչև 5 ՄԲ</span>
      </button>
    </div>
    <input ref="input" type="file" :accept="accept" multiple class="sr-only" aria-label="Ընտրել նկարներ" @change="onPick" />
  </div>
</template>
