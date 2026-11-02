import type { ImageInputDto } from '../dto/image-input.dto';

export interface NormalizedImage {
  url: string;
  path: string | null;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
}

/** Ensures stable sort order and exactly one main image. */
export function normalizeImages(images: ImageInputDto[] = []): NormalizedImage[] {
  const list = images.map((img, index) => ({
    url: img.url,
    path: img.path ?? null,
    alt: img.alt ?? null,
    isMain: !!img.isMain,
    sortOrder: index,
  }));
  const mainIndex = list.findIndex((i) => i.isMain);
  list.forEach((img, i) => (img.isMain = i === (mainIndex === -1 ? 0 : mainIndex)));
  return list;
}

/** Paths that existed before and are no longer referenced. */
export function removedPaths(before: { path: string | null }[], after: { path: string | null }[]): string[] {
  const keep = new Set(after.map((i) => i.path).filter(Boolean));
  return before.map((i) => i.path).filter((p): p is string => !!p && !keep.has(p));
}
