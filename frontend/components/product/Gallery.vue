<script setup lang="ts">
const props = defineProps<{ images: { url: string; alt: string | null }[]; name: string }>();
const active = ref(0);
const track = ref<HTMLElement | null>(null);

function go(i: number) {
  const n = props.images.length;
  active.value = (i + n) % n;
  const el = track.value?.children[active.value] as HTMLElement | undefined;
  track.value?.scrollTo({ left: el?.offsetLeft ?? 0, behavior: 'smooth' });
}
function onScroll() {
  if (!track.value) return;
  const i = Math.round(track.value.scrollLeft / track.value.clientWidth);
  if (i !== active.value) active.value = i;
}
</script>

<template>
  <div class="space-y-3" role="region" aria-roledescription="carousel" :aria-label="`${name} — նկարներ`" @keydown.left="go(active - 1)" @keydown.right="go(active + 1)">
    <div class="relative overflow-hidden rounded-card bg-cream">
      <div v-if="images.length" ref="track" class="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" @scroll.passive="onScroll">
        <div v-for="(img, i) in images" :key="img.url" class="w-full shrink-0 snap-center" :aria-hidden="i !== active">
          <UiImg :src="img.url" :alt="img.alt || `${name} — նկար ${i + 1}`" :eager="i === 0" sizes="(min-width: 1024px) 55vw, 100vw" :width="1200" :height="900" img-class="aspect-[4/3] w-full object-cover" />
        </div>
      </div>
      <UiImg v-else :alt="name" img-class="aspect-[4/3] w-full" />
      <template v-if="images.length > 1">
        <button type="button" class="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-espresso shadow-soft hover:bg-white sm:block" aria-label="Նախորդ նկար" @click="go(active - 1)">
          <UiIcon name="chevron-left" />
        </button>
        <button type="button" class="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-espresso shadow-soft hover:bg-white sm:block" aria-label="Հաջորդ նկար" @click="go(active + 1)">
          <UiIcon name="chevron-right" />
        </button>
        <span class="absolute bottom-3 right-3 rounded-full bg-espresso/70 px-2.5 py-1 text-sm text-linen">{{ active + 1 }} / {{ images.length }}</span>
      </template>
    </div>
    <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(img, i) in images"
        :key="img.url"
        type="button"
        class="w-20 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-linen transition sm:w-24"
        :class="i === active ? 'ring-brass' : 'ring-transparent opacity-70 hover:opacity-100'"
        :aria-label="`Նկար ${i + 1}`"
        :aria-current="i === active"
        @click="go(i)"
      >
        <UiImg :src="img.url" :alt="''" sizes="96px" :width="160" :height="120" img-class="aspect-[4/3] w-full object-cover" />
      </button>
    </div>
  </div>
</template>
