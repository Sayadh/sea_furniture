import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizeImages, removedPaths } from '../common/utils/images';
import { slugify } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

const imageOrder: Prisma.ServiceImageOrderByWithRelationInput[] = [{ isMain: 'desc' }, { sortOrder: 'asc' }];

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  findPublic() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true, title: true, slug: true, shortDescription: true, description: true,
        priceFrom: true, duration: true, seoTitle: true, seoDescription: true,
        images: { select: { url: true, alt: true }, orderBy: imageOrder },
      },
    });
  }

  async findPublicBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, isActive: true },
      include: { images: { select: { url: true, alt: true }, orderBy: imageOrder } },
    });
    if (!service) throw new NotFoundException('Ծառայությունը չի գտնվել');
    return service;
  }

  findAllAdmin() {
    return this.prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        images: { orderBy: imageOrder, take: 1 },
        _count: { select: { repairRequests: true, portfolioItems: true } },
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!service) throw new NotFoundException('Ծառայությունը չի գտնվել');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const { images, ...data } = dto;
    const slug = dto.slug ?? slugify(dto.title);
    if (!slug) throw new ConflictException('Չհաջողվեց ստեղծել slug։ Լրացրեք այն ձեռքով');
    const max = await this.prisma.service.aggregate({ _max: { sortOrder: true } });
    return this.prisma.service.create({
      data: {
        ...data,
        slug,
        sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
        images: { create: normalizeImages(images) },
      },
      include: { images: true },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.findOne(id);
    const { images, ...data } = dto;
    const next = images ? normalizeImages(images) : null;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (next) {
        await tx.serviceImage.deleteMany({ where: { serviceId: id } });
        if (next.length) await tx.serviceImage.createMany({ data: next.map((i) => ({ ...i, serviceId: id })) });
      }
      return tx.service.update({ where: { id }, data, include: { images: { orderBy: { sortOrder: 'asc' } } } });
    });
    if (next) await this.storage.remove(removedPaths(existing.images, next));
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    // Requests and portfolio items keep working: FK is SetNull and requests store serviceTitle.
    await this.prisma.service.delete({ where: { id } });
    await this.storage.remove(existing.images.map((i) => i.path));
    return { ok: true };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.service.update({ where: { id }, data: { sortOrder: index } })));
    return { ok: true };
  }
}
