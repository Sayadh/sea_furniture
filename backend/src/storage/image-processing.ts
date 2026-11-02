import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import sharp from 'sharp';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'heif']);

/** Multer file filter: rejects non-image MIME types before buffering finishes. */
export function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
): void {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    cb(new BadRequestException('Թույլատրվում են միայն JPG, PNG, WEBP կամ AVIF նկարներ'), false);
    return;
  }
  cb(null, true);
}

/**
 * Validates real file content (magic bytes via sharp) and converts to optimized WebP.
 * MIME type from the client is never trusted on its own.
 */
export async function processImage(file: Express.Multer.File, maxWidth = 1920): Promise<Buffer> {
  if (file.size > MAX_IMAGE_BYTES) throw new PayloadTooLargeException('Նկարի չափը չպետք է գերազանցի 5 ՄԲ-ը');
  let format: string | undefined;
  try {
    const meta = await sharp(file.buffer).metadata();
    format = meta.format;
    if (!meta.width || !meta.height || meta.width * meta.height > 50_000_000) format = undefined;
  } catch {
    format = undefined;
  }
  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new BadRequestException('Ֆայլը նկար չէ կամ վնասված է');
  }
  return sharp(file.buffer, { failOn: 'error' })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
