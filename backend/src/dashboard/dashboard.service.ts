import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const liveOrders = { deletedAt: null };
    const [
      productsTotal, productsActive, newOrders, newRequests, requestsTotal, recentOrders, topViewed, byStatus, recentRequests,
    ] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.order.count({ where: { ...liveOrders, status: OrderStatus.NEW } }),
      this.prisma.repairRequest.count({ where: { deletedAt: null, status: 'NEW' } }),
      this.prisma.repairRequest.count({ where: { deletedAt: null } }),
      this.prisma.order.findMany({
        where: liveOrders,
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, orderNumber: true, firstName: true, lastName: true, phone: true, totalAmount: true, status: true, createdAt: true },
      }),
      this.prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { viewCount: 'desc' },
        take: 6,
        select: {
          id: true, name: true, slug: true, viewCount: true, price: true,
          images: { select: { url: true }, orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }], take: 1 },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: liveOrders,
        orderBy: { status: 'asc' },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.repairRequest.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, requestNumber: true, name: true, phone: true, source: true, serviceTitle: true, status: true, createdAt: true },
      }),
    ]);

    const salesByStatus = Object.values(OrderStatus).map((status) => {
      const row = byStatus.find((r) => r.status === status);
      const count = row?._count;
      return {
        status,
        count: typeof count === 'object' && count ? (count._all ?? 0) : 0,
        total: row?._sum?.totalAmount ?? 0,
      };
    });

    return {
      counts: { productsTotal, productsActive, newOrders, newRequests, requestsTotal },
      salesByStatus,
      recentOrders,
      recentRequests,
      topViewed,
    };
  }
}
