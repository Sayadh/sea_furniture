import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const productWhere: Prisma.ProductWhereInput = { isActive: true, deletedAt: null, category: { isActive: true } };
const imageOrder: Prisma.ProductImageOrderByWithRelationInput[] = [{ isMain: 'desc' }, { sortOrder: 'asc' }];

/** Public, read-only data sources for the frontend's sitemaps and llms.txt (only what the site already shows). */
@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly prisma: PrismaService) {}

  /** Sitemap data: URLs + last modification dates (+ product images for the image sitemap). */
  @Get('sitemap')
  async sitemap() {
    const [products, categories, services, portfolio, faq, settings] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: productWhere,
        orderBy: { updatedAt: 'desc' },
        select: { slug: true, updatedAt: true, images: { select: { url: true }, orderBy: imageOrder, take: 10 } },
      }),
      this.prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.service.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.portfolioItem.aggregate({ where: { isActive: true }, _max: { updatedAt: true } }),
      this.prisma.faq.aggregate({ where: { isActive: true }, _max: { updatedAt: true } }),
      this.prisma.siteSettings.findUnique({ where: { key: 'main' }, select: { updatedAt: true } }),
    ]);
    return {
      products,
      categories,
      services,
      portfolioUpdatedAt: portfolio._max.updatedAt,
      faqUpdatedAt: faq._max.updatedAt,
      settingsUpdatedAt: settings?.updatedAt ?? null,
    };
  }

  /** Business summary for /llms.txt (AI assistants). Deliberately without prices. */
  @Get('llms')
  async llms() {
    const [settings, categories, services, products, faqs] = await this.prisma.$transaction([
      this.prisma.siteSettings.findUnique({
        where: { key: 'main' },
        select: {
          siteName: true, phone: true, phone2: true, whatsapp: true, address: true, workingHours: true,
          instagramUrl: true, tiktokUrl: true, facebookUrl: true, deliveryInfo: true, seoDescription: true,
        },
      }),
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { name: true, slug: true, description: true },
      }),
      this.prisma.service.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        select: { title: true, slug: true, shortDescription: true, duration: true },
      }),
      this.prisma.product.findMany({
        where: productWhere,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: { name: true, slug: true, shortDescription: true, material: true, availability: true, category: { select: { name: true } } },
      }),
      this.prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { question: true, answer: true } }),
    ]);
    return { settings, categories, services, products, faqs };
  }
}
