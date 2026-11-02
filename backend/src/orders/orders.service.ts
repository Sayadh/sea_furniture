import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateOrderNumber } from '../common/utils/codes';
import { paginate } from '../common/dto/pagination.dto';
import { phoneSearchFragment } from '../common/utils/search';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOrderQueryDto, CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Prices are always taken from the database (never from the client) and
   * snapshotted into OrderItem, so later price changes don't affect old orders.
   */
  async create(dto: CreateOrderDto) {
    // Merge duplicate lines
    const quantities = new Map<string, number>();
    for (const item of dto.items) quantities.set(item.productId, Math.min(99, (quantities.get(item.productId) ?? 0) + item.quantity));

    const products = await this.prisma.product.findMany({
      where: { id: { in: [...quantities.keys()] }, isActive: true, deletedAt: null, category: { isActive: true } },
      include: { images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }], take: 1 } },
    });
    if (products.length !== quantities.size) {
      throw new BadRequestException('Զամբյուղի որոշ ապրանքներ այլևս հասանելի չեն։ Թարմացրեք զամբյուղը և փորձեք կրկին');
    }
    const unavailable = products.filter((p) => p.availability === 'OUT_OF_STOCK');
    if (unavailable.length) {
      throw new BadRequestException(`Հետևյալ ապրանքներն այս պահին առկա չեն՝ ${unavailable.map((p) => p.name).join(', ')}`);
    }

    const items = products.map((p) => {
      const quantity = quantities.get(p.id)!;
      return {
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        productSku: p.sku,
        imageUrl: p.images[0]?.url ?? null,
        unitPrice: p.price,
        quantity,
        lineTotal: p.price * quantity,
      };
    });
    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const order = await this.prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            altPhone: dto.altPhone,
            region: dto.region,
            address: dto.address,
            deliveryNotes: dto.deliveryNotes,
            comment: dto.comment,
            totalAmount,
            itemsCount,
            items: { create: items },
          },
          select: { orderNumber: true, totalAmount: true, itemsCount: true, createdAt: true },
        });
        return order;
      } catch (e) {
        const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
        if (!collision) throw e;
      }
    }
    throw new InternalServerErrorException('Պատվերը ստեղծել չհաջողվեց։ Խնդրում ենք փորձել կրկին');
  }

  async findAdmin(q: AdminOrderQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.OrderWhereInput = { deletedAt: q.archived ? { not: null } : null };
    if (q.status) where.status = q.status;
    if (q.dateFrom || q.dateTo) {
      const to = q.dateTo ? new Date(q.dateTo) : undefined;
      if (to && q.dateTo!.length <= 10) to.setHours(23, 59, 59, 999); // date-only → inclusive end of day
      where.createdAt = { gte: q.dateFrom ? new Date(q.dateFrom) : undefined, lte: to };
    }
    if (q.search) {
      const or: Prisma.OrderWhereInput[] = [{ orderNumber: { contains: q.search.toUpperCase() } }];
      const fragment = phoneSearchFragment(q.search);
      if (fragment) or.push({ phone: { contains: fragment } }, { altPhone: { contains: fragment } });
      or.push({ lastName: { contains: q.search } }, { firstName: { contains: q.search } });
      where.OR = or;
    }
    const orderBy: Prisma.OrderOrderByWithRelationInput =
      q.sort === 'oldest' ? { createdAt: 'asc' } : q.sort === 'total_desc' ? { totalAmount: 'desc' } : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) throw new NotFoundException('Պատվերը չի գտնվել');
    return order;
  }

  async updateStatus(id: string, status: Prisma.OrderUpdateInput['status']) {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async updateNote(id: string, adminNote: string | null) {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: { adminNote } });
  }

  async archive(id: string) {
    await this.findOne(id);
    await this.prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
    return { ok: true };
  }

  async restore(id: string) {
    await this.findOne(id);
    await this.prisma.order.update({ where: { id }, data: { deletedAt: null } });
    return { ok: true };
  }
}
