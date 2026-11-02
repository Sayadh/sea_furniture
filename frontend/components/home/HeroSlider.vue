<script setup lang="ts">
import type { HeroSlide } from '~/types/api';

/**
 * Home hero product slider: native scroll-snap (swipe on touch devices), arrows + dots,
 * autoplay every 5 s that pauses on hover/focus/touch, in hidden tabs and for reduced motion.
 */
const props = defineProps<{ slides: HeroSlide[] }>();

const AUTOPLAY_MS = 5000;
const track = ref<HTMLElement | null>(null);
const active = ref(0);
const paused = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
let resumeTimer: ReturnType<typeof setTimeout> | undefined;

const count = computed(() => props.slides.length);

function goTo(index: number, smooth = true) {
  const el = track.value;
  if (!el || !count.value) return;
  const i = (index + count.value) % count.value;
  el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  active.value = i;
}

function onScroll() {
  const el = track.value;
  if (el?.clientWidth) active.value = Math.round(el.scrollLeft / el.clientWidth);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = undefined;
}

function start() {
  stop();
  if (count.value < 2 || paused.value || document.hidden) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  timer = setInterval(() => goTo(active.value + 1), AUTOPLAY_MS);
}

function pause() {
  paused.value = true;
  if (resumeTimer) clearTimeout(resumeTimer);
  stop();
}

/** Resume after the user stops interacting (touch has no "leave" event). */
function resumeLater(delay = AUTOPLAY_MS) {
  if (resumeTimer) clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => {
    paused.value = false;
    start();
  }, delay);
}

function onVisibility() {
  if (document.hidden) stop();
  else start();
}

/** Arrow/dot clicks restart the countdown so the next slide doesn't jump right away. */
function navigate(index: number) {
  goTo(index);
  if (!paused.value) start();
}

onMounted(() => {
  start();
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });
});

onBeforeUnmount(() => {
  stop();
  if (resumeTimer) clearTimeout(resumeTimer);
  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('resize', onResize);
});

/** Keep the current slide aligned when the viewport width changes. */
function onResize() {
  goTo(active.value, false);
}
</script>

<template>
  <!-- Fills its parent: the parent decides the height -->
  <div
    class="relative h-full"
    role="region"
    aria-roledescription="carousel"
    aria-label="Առաջարկվող ապրանքներ"
    @mouseenter="pause"
    @mouseleave="resumeLater(0)"
    @focusin="pause"
    @focusout="resumeLater(0)"
    @touchstart.passive="pause"
    @touchend.passive="resumeLater()"
  >
    <div
      ref="track"
      class="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll.passive="onScroll"
    >
      <NuxtLink
        v-for="(s, i) in slides"
        :key="s.id"
        :to="`/products/${s.slug}`"
        class="group relative block h-full w-full shrink-0 snap-start overflow-hidden"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${i + 1} / ${count}՝ ${s.name}`"
        :tabindex="i === active ? 0 : -1"
      >
        <UiImg
          :src="s.images[0]?.url"
          :alt="s.images[0]?.alt || s.name"
          :eager="i === 0"
          sizes="100vw"
          :width="1600"
          :height="1200"
          img-class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/15 to-transparent" />
        <!-- On desktop the caption sits bottom-right: the hero actions card covers the bottom-left -->
        <div class="absolute inset-x-0 bottom-0 p-5 pb-12 sm:p-7 sm:pb-14 lg:left-auto lg:max-w-[44%] lg:p-12 lg:pb-20 lg:text-right">
          <p class="text-sm uppercase tracking-[0.14em] text-linen/70">{{ s.category.name }}</p>
          <p class="mt-1 max-w-[24ch] font-serif text-h2 text-linen lg:ml-auto">{{ s.name }}</p>
          <div class="mt-2 flex flex-wrap items-baseline gap-x-2.5 text-linen lg:justify-end">
            <span v-if="s.price > 0" class="text-lg font-semibold">{{ formatPrice(s.price) }}</span>
            <s v-if="s.price > 0 && s.oldPrice && s.oldPrice > s.price" class="text-sm text-linen/60">
              <span class="sr-only">Նախկին գինը՝</span>{{ formatPrice(s.oldPrice) }}
            </s>
            <span class="ml-1 inline-flex items-center gap-1 text-sm font-medium text-brass transition group-hover:gap-2">
              Դիտել <UiIcon name="chevron-right" :size="14" />
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <template v-if="count > 1">
      <button
        type="button"
        class="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-linen/85 p-2.5 text-espresso shadow transition hover:bg-brass sm:block lg:left-8"
        aria-label="Նախորդ ապրանքը"
        @click="navigate(active - 1)"
      >
        <UiIcon name="chevron-left" :size="18" />
      </button>
      <button
        type="button"
        class="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-linen/85 p-2.5 text-espresso shadow transition hover:bg-brass sm:block lg:right-8"
        aria-label="Հաջորդ ապրանքը"
        @click="navigate(active + 1)"
      >
        <UiIcon name="chevron-right" :size="18" />
      </button>
      <div class="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:bottom-5 lg:bottom-10 lg:justify-end lg:pr-12">
        <button
          v-for="(s, i) in slides"
          :key="s.id"
          type="button"
          class="h-2 rounded-full transition-all"
          :class="i === active ? 'w-6 bg-brass' : 'w-2 bg-linen/50 hover:bg-linen/80'"
          :aria-label="`Ապրանք ${i + 1}`"
          :aria-current="i === active ? 'true' : undefined"
          @click="navigate(i)"
        />
      </div>
    </template>

    <div class="pointer-events-none absolute inset-4 hidden rounded-[10px] border-[1.5px] border-dashed border-linen/40 lg:block" aria-hidden="true" />
  </div>
</template>
