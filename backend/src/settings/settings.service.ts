import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateSettingsDto } from './dto/settings.dto';

const KEY = 'main';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async get() {
    return this.prisma.siteSettings.upsert({ where: { key: KEY }, update: {}, create: { key: KEY } });
  }

  async getPublic() {
    // Storage paths are internal: the site only needs the public URLs
    const { logoPath, heroImagePath, aboutImage1Path, aboutImage2Path, aboutImage3Path, id, key, createdAt, ...rest } = await this.get();
    void logoPath; void heroImagePath; void aboutImage1Path; void aboutImage2Path; void aboutImage3Path; void id; void key; void createdAt;
    return rest;
  }

  async update(dto: UpdateSettingsDto) {
    const before = await this.get();
    const after = await this.prisma.siteSettings.update({ where: { key: KEY }, data: dto });
    const stale = [
      before.logoPath !== after.logoPath ? before.logoPath : null,
      before.heroImagePath !== after.heroImagePath ? before.heroImagePath : null,
      before.aboutImage1Path !== after.aboutImage1Path ? before.aboutImage1Path : null,
      before.aboutImage2Path !== after.aboutImage2Path ? before.aboutImage2Path : null,
      before.aboutImage3Path !== after.aboutImage3Path ? before.aboutImage3Path : null,
    ];
    await this.storage.remove(stale);
    return after;
  }
}
