import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug';
import { StorageService } from '../storage/storage.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

const activeProducts = { where: { isActive: true, deletedAt: null } };

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  findPublic() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true, description: true, imageUrl: true,
        seoTitle: true, seoDescription: true,
        _count: { select: { products: activeProducts } },
      },
    });
  }

  async findPublicBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({ where: { slug, isActive: true } });
    if (!category) throw new NotFoundException('Բաժինը չի գտնվել');
    return category;
  }

  findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Բաժինը չի գտնվել');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ?? slugify(dto.name);
    if (!slug) throw new ConflictException('Չհաջողվեց ստեղծել slug։ Լրացրեք այն ձեռքով');
    const max = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
    return this.prisma.category.create({
      data: { ...dto, slug, sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? 0) + 1 },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.category.update({ where: { id }, data: dto });
    if (existing.imagePath && existing.imagePath !== updated.imagePath) await this.storage.remove([existing.imagePath]);
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const count = await this.prisma.product.count({ where: { categoryId: id, deletedAt: null } });
    if (count > 0) {
      throw new ConflictException(
        `Բաժինը հնարավոր չէ ջնջել․ այն պարունակում է ${count} ապրանք։ Նախ տեղափոխեք կամ ջնջեք ապրանքները, կամ պարզապես անջատեք բաժինը։`,
      );
    }
    // Archived (soft-deleted) products are purged: order items keep their own price/name snapshot.
    const archivedImages = await this.prisma.productImage.findMany({
      where: { product: { categoryId: id } },
      select: { path: true },
    });
    await this.prisma.$transaction([
      this.prisma.product.deleteMany({ where: { categoryId: id } }),
      this.prisma.category.delete({ where: { id } }),
    ]);
    await this.storage.remove([existing.imagePath, ...archivedImages.map((i) => i.path)]);
    return { ok: true };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.category.update({ where: { id }, data: { sortOrder: index } })));
    return { ok: true };
  }
}
