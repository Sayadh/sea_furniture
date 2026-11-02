import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

/** Data source for the frontend sitemap.xml */
@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('sitemap')
  async sitemap() {
    const [products, categories, services] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { isActive: true, deletedAt: null, category: { isActive: true } },
        select: { slug: true, updatedAt: true, images: { select: { url: true }, where: { isMain: true }, take: 1 } },
      }),
      this.prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      this.prisma.service.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
    return { products, categories, services };
  }
}
