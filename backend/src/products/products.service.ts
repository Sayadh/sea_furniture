import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { paginate } from '../common/dto/pagination.dto';
import { normalizeImages, removedPaths } from '../common/utils/images';
import { slugify } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { AdminProductQueryDto, PublicProductQueryDto } from './dto/product-query.dto';

const imageOrder: Prisma.ProductImageOrderByWithRelationInput[] = [{ isMain: 'desc' }, { sortOrder: 'asc' }];

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  price: true,
  oldPrice: true,
  availability: true,
  isNew: true,
  isOnSale: true,
  isFeatured: true,
  category: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: imageOrder, take: 2 },
} satisfies Prisma.ProductSelect;

/** Home page hero slider capacity. Marking one more product removes the oldest from the slider. */
export const HERO_SLIDES_MAX = 10;

const publicWhere: Prisma.ProductWhereInput = { isActive: true, deletedAt: null, category: { isActive: true } };

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ─────────────── Public ───────────────

  async findPublic(q: PublicProductQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 12;
    const where: Prisma.ProductWhereInput = { ...publicWhere };
    const and: Prisma.ProductWhereInput[] = [];

    if (q.category) where.category = { isActive: true, slug: q.category };
    if (q.search) {
      and.push({
        OR: [
          { name: { contains: q.search } },
          { shortDescription: { contains: q.search } },
          { material: { contains: q.search } },
          { sku: { equals: q.search } },
        ],
      });
    }
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = { gte: q.minPrice, lte: q.maxPrice };
    }
    if (q.inStock) where.availability = 'IN_STOCK';
    if (q.featured) where.isFeatured = true;
    if (q.isNew) where.isNew = true;
    if (q.onSale) where.isOnSale = true;
    if (and.length) where.AND = and;

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
      switch (q.sort) {
        case 'newest': return [{ createdAt: 'desc' }];
        case 'price_asc': return [{ price: 'asc' }];
        case 'price_desc': return [{ price: 'desc' }];
        case 'popular': return [{ viewCount: 'desc' }];
        default: return [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
      }
    })();
    orderBy.push({ id: 'asc' }); // deterministic pagination

    const [items, total, priceRange] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, select: productCardSelect }),
      this.prisma.product.count({ where }),
      this.prisma.product.aggregate({ where: publicWhere, _min: { price: true }, _max: { price: true } }),
    ]);
    return {
      ...paginate(items, total, page, limit),
      priceRange: { min: priceRange._min.price ?? 0, max: priceRange._max.price ?? 0 },
    };
  }

  async findPublicBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { ...publicWhere, slug },
      select: {
        id: true, name: true, slug: true, sku: true, shortDescription: true, description: true,
        price: true, oldPrice: true, dimensions: true, material: true, color: true,
        availability: true, stockQuantity: true, productionTime: true,
        isNew: true, isOnSale: true, isFeatured: true, seoTitle: true, seoDescription: true,
        createdAt: true, updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true, url: true, alt: true, isMain: true }, orderBy: imageOrder },
      },
    });
    if (!product) throw new NotFoundException('Ապրանքը չի գտնվել');

    const related = await this.prisma.product.findMany({
      where: { ...publicWhere, categoryId: product.category.id, id: { not: product.id } },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 4,
      select: productCardSelect,
    });
    return { ...product, related };
  }

  /** Products marked for the hero slider (newest first); falls back to the newest products with photos. */
  async findHeroSlides() {
    const select = {
      id: true,
      name: true,
      slug: true,
      price: true,
      oldPrice: true,
      category: { select: { name: true } },
      images: { select: { url: true, alt: true }, orderBy: imageOrder, take: 1 },
    } satisfies Prisma.ProductSelect;

    const marked = await this.prisma.product.findMany({
      where: { ...publicWhere, heroSlideAt: { not: null } },
      orderBy: { heroSlideAt: 'desc' },
      take: HERO_SLIDES_MAX,
      select,
    });
    if (marked.length) return marked;

    return this.prisma.product.findMany({
      where: { ...publicWhere, images: { some: {} } },
      orderBy: { createdAt: 'desc' },
      take: HERO_SLIDES_MAX,
      select,
    });
  }

  async registerView(slug: string) {
    await this.prisma.product.updateMany({ where: { slug, ...publicWhere }, data: { viewCount: { increment: 1 } } });
    return { ok: true };
  }

  /** Used by the cart to refresh prices/availability of stored items. */
  findManyForCart(ids: string[]) {
    return this.prisma.product.findMany({
      where: { ...publicWhere, id: { in: ids } },
      select: productCardSelect,
    });
  }

  // ─────────────── Admin ───────────────

  async findAdmin(q: AdminProductQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.status === 'active') where.isActive = true;
    if (q.status === 'hidden') where.isActive = false;
    if (q.search) {
      where.OR = [
        { name: { contains: q.search } },
        { sku: { contains: q.search } },
        { slug: { contains: q.search } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, slug: true, sku: true, price: true, oldPrice: true, availability: true,
          stockQuantity: true, isActive: true, isFeatured: true, isNew: true, isOnSale: true, heroSlideAt: true,
          sortOrder: true, viewCount: true, createdAt: true,
          category: { select: { id: true, name: true } },
          images: { select: { url: true }, orderBy: imageOrder, take: 1 },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  async findOneAdmin(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException('Ապրանքը չի գտնվել');
    return product;
  }

  async create(dto: CreateProductDto) {
    const { images, isHeroSlide, ...data } = dto;
    const slug = await this.uniqueSlug(dto.slug ?? slugify(dto.name));
    await this.assertCategory(dto.categoryId);
    const max = await this.prisma.product.aggregate({ _max: { sortOrder: true }, where: { deletedAt: null } });
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...data,
          slug,
          sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
          heroSlideAt: isHeroSlide ? new Date() : null,
          images: { create: normalizeImages(images) },
        },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
      if (isHeroSlide) await this.trimHeroSlides(tx);
      return created;
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOneAdmin(id);
    const { images, isHeroSlide, ...data } = dto;
    // Keep the original position when the product is already in the slider
    const heroSlideAt = isHeroSlide === undefined ? undefined : isHeroSlide ? (existing.heroSlideAt ?? new Date()) : null;
    if (dto.categoryId) await this.assertCategory(dto.categoryId);
    if (dto.slug && dto.slug !== existing.slug) {
      const taken = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
      if (taken) throw new ConflictException('Այս slug-ը արդեն օգտագործվում է');
    }

    const next = images ? normalizeImages(images) : null;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (next) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (next.length) await tx.productImage.createMany({ data: next.map((i) => ({ ...i, productId: id })) });
      }
      const saved = await tx.product.update({
        where: { id },
        data: { ...data, heroSlideAt },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
      if (isHeroSlide && !existing.heroSlideAt) await this.trimHeroSlides(tx);
      return saved;
    });
    if (next) await this.storage.remove(removedPaths(existing.images, next));
    return updated;
  }

  /** Soft delete: keeps the row for historical order links, frees slug/sku for reuse. */
  async remove(id: string) {
    const existing = await this.findOneAdmin(id);
    const suffix = randomBytes(3).toString('hex');
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false, heroSlideAt: null, slug: `${existing.slug}-deleted-${suffix}`.slice(0, 190), sku: null },
    });
    return { ok: true };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.product.update({ where: { id }, data: { sortOrder: index } })));
    return { ok: true };
  }

  /** Keeps only the newest HERO_SLIDES_MAX products in the hero slider. */
  private async trimHeroSlides(tx: Prisma.TransactionClient) {
    const stale = await tx.product.findMany({
      where: { heroSlideAt: { not: null }, deletedAt: null },
      orderBy: { heroSlideAt: 'desc' },
      skip: HERO_SLIDES_MAX,
      select: { id: true },
    });
    if (stale.length) {
      await tx.product.updateMany({ where: { id: { in: stale.map((p) => p.id) } }, data: { heroSlideAt: null } });
    }
  }

  private async assertCategory(id: string) {
    const exists = await this.prisma.category.count({ where: { id } });
    if (!exists) throw new NotFoundException('Բաժինը չի գտնվել');
  }

  private async uniqueSlug(base: string): Promise<string> {
    const root = base || `product-${randomBytes(3).toString('hex')}`;
    let slug = root;
    for (let i = 2; await this.prisma.product.findUnique({ where: { slug }, select: { id: true } }); i++) {
      slug = `${root}-${i}`;
    }
    return slug;
  }
}
