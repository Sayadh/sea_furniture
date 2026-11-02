import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { dirname, join, resolve, sep } from 'path';
import { processImage } from './image-processing';

export interface StoredFile {
  url: string;
  path: string;
}

export const UPLOAD_FOLDERS = ['products', 'categories', 'services', 'portfolio', 'settings', 'requests'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/**
 * Image storage on the server's own disk (UPLOAD_DIR, default ./uploads).
 * Files are served by the API under /uploads/... and referenced with relative URLs.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(config.get<string>('UPLOAD_DIR', 'uploads'));
  }

  get uploadDir(): string {
    return this.root;
  }

  private buildPath(folder: UploadFolder): string {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${folder}/${now.getFullYear()}/${mm}/${randomUUID()}.webp`;
  }

  /** Resolves a stored relative path and guarantees it stays inside the upload directory. */
  private safeTarget(path: string): string | null {
    const target = resolve(join(this.root, path));
    return target.startsWith(this.root + sep) ? target : null;
  }

  async uploadImage(file: Express.Multer.File, folder: UploadFolder): Promise<StoredFile> {
    const buffer = await processImage(file);
    const path = this.buildPath(folder);
    const target = this.safeTarget(path)!;
    try {
      await fs.mkdir(dirname(target), { recursive: true });
      await fs.writeFile(target, buffer, { mode: 0o644 });
    } catch (e) {
      this.logger.error(`Image write failed: ${(e as Error).message}`);
      throw new InternalServerErrorException('Նկարը պահպանել չհաջողվեց');
    }
    return { url: `/uploads/${path}`, path };
  }

  /** Best-effort deletion; failures are logged, never thrown (DB state is the source of truth). */
  async remove(paths: (string | null | undefined)[]): Promise<void> {
    await Promise.all(
      paths
        .filter((p): p is string => !!p)
        .map(async (p) => {
          const target = this.safeTarget(p);
          if (!target) return;
          try {
            await fs.rm(target, { force: true });
          } catch (e) {
            this.logger.warn(`Image remove failed: ${(e as Error).message}`);
          }
        }),
    );
  }
}
