import { Injectable, NotFoundException } from '@nestjs/common';
import { removedPaths } from '../common/utils/images';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePortfolioDto, PortfolioImageInputDto, UpdatePortfolioDto } from './dto/portfolio.dto';

function toImages(images: PortfolioImageInputDto[] = []) {
  return images.map((img, index) => ({
    url: img.url,
    path: img.path ?? null,
    alt: img.alt ?? null,
    kind: img.kind,
    sortOrder: index,
  }));
}

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  findPublic(limit?: number) {
    return this.prisma.portfolioItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
        id: true, title: true, description: true, createdAt: true,
        service: { select: { title: true, slug: true } },
        images: { select: { url: true, alt: true, kind: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  findAllAdmin() {
    return this.prisma.portfolioItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { service: { select: { id: true, title: true } }, images: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!item) throw new NotFoundException('Աշխատանքը չի գտնվել');
    return item;
  }

  async create(dto: CreatePortfolioDto) {
    const { images, ...data } = dto;
    const max = await this.prisma.portfolioItem.aggregate({ _max: { sortOrder: true } });
    return this.prisma.portfolioItem.create({
      data: { ...data, sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? 0) + 1, images: { create: toImages(images) } },
      include: { images: true },
    });
  }

  async update(id: string, dto: UpdatePortfolioDto) {
    const existing = await this.findOne(id);
    const { images, ...data } = dto;
    const next = images ? toImages(images) : null;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (next) {
        await tx.portfolioImage.deleteMany({ where: { portfolioItemId: id } });
        if (next.length) await tx.portfolioImage.createMany({ data: next.map((i) => ({ ...i, portfolioItemId: id })) });
      }
      return tx.portfolioItem.update({ where: { id }, data, include: { images: { orderBy: { sortOrder: 'asc' } } } });
    });
    if (next) await this.storage.remove(removedPaths(existing.images, next));
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.prisma.portfolioItem.delete({ where: { id } });
    await this.storage.remove(existing.images.map((i) => i.path));
    return { ok: true };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.portfolioItem.update({ where: { id }, data: { sortOrder: index } })));
    return { ok: true };
  }
}
