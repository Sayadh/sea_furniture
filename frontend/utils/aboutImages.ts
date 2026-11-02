import type { SiteSettings } from '~/types/api';

type AboutSlot = 1 | 2 | 3;

/** Built-in «Մեր մասին» photos, shown until the admin uploads their own (Admin → Կարգավորումներ). */
export const ABOUT_IMAGE_DEFAULTS: Record<AboutSlot, { src: string; alt: string }> = {
  1: { src: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&q=80&auto=format&fit=crop', alt: 'Կտորի ձևավորում արտադրամասում' },
  2: { src: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80&auto=format&fit=crop', alt: 'Վարպետի գործիքներ' },
  3: { src: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200&q=80&auto=format&fit=crop', alt: 'Կտորների նմուշներ' },
};

/** Uploaded image + alt for a slot; each part falls back to the built-in default independently. */
export function aboutImage(settings: SiteSettings | null | undefined, n: AboutSlot) {
  const def = ABOUT_IMAGE_DEFAULTS[n];
  return {
    src: settings?.[`aboutImage${n}Url`] || def.src,
    alt: settings?.[`aboutImage${n}Alt`]?.trim() || def.alt,
  };
}
