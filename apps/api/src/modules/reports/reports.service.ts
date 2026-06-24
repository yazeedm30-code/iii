import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ReportRange {
  from: Date;
  to: Date;
  branchId?: string;
  merchantId?: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async salesSummary(range: ReportRange) {
    const where = this.buildWhere(range);
    const agg = await this.prisma.order.aggregate({
      where,
      _count: { _all: true },
      _sum: { totalAmount: true, subtotal: true, taxAmount: true, discountAmount: true },
      _avg: { totalAmount: true },
    });
    return {
      orders: agg._count._all,
      revenue: Number(agg._sum.totalAmount ?? 0),
      subtotal: Number(agg._sum.subtotal ?? 0),
      tax: Number(agg._sum.taxAmount ?? 0),
      discount: Number(agg._sum.discountAmount ?? 0),
      averageTicket: Number(agg._avg.totalAmount ?? 0),
    };
  }

  async hourlyDistribution(range: ReportRange) {
    const where = this.buildWhere(range);
    const orders = await this.prisma.order.findMany({
      where,
      select: { placedAt: true, totalAmount: true },
    });
    const buckets: Array<{ hour: number; orders: number; revenue: number }> = Array.from(
      { length: 24 },
      (_, hour) => ({ hour, orders: 0, revenue: 0 }),
    );
    for (const o of orders) {
      const hour = (o.placedAt ?? new Date()).getHours();
      buckets[hour].orders += 1;
      buckets[hour].revenue += Number(o.totalAmount);
    }
    return buckets;
  }

  async topProducts(range: ReportRange, limit = 10) {
    const where = this.buildWhere(range);
    const items = await this.prisma.orderItem.findMany({
      where: { order: where },
      include: { product: true },
    });
    const map = new Map<string, { id: string; name: string; nameAr: string; quantity: number; revenue: number }>();
    for (const item of items) {
      const key = item.productId;
      const acc = map.get(key) ?? {
        id: item.product.id,
        name: item.product.name,
        nameAr: item.product.nameAr,
        quantity: 0,
        revenue: 0,
      };
      acc.quantity += item.quantity;
      acc.revenue += Number(item.lineTotal);
      map.set(key, acc);
    }
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async branchPerformance(range: ReportRange) {
    const where = this.buildWhere(range);
    const grouped = await this.prisma.order.groupBy({
      by: ['branchId'],
      where,
      _count: { _all: true },
      _sum: { totalAmount: true },
    });
    const branches = await this.prisma.branch.findMany({
      where: { id: { in: grouped.map((g) => g.branchId) } },
    });
    const map = new Map(branches.map((b) => [b.id, b]));
    return grouped.map((g) => ({
      branchId: g.branchId,
      branchName: map.get(g.branchId)?.nameAr,
      orders: g._count._all,
      revenue: Number(g._sum.totalAmount ?? 0),
    }));
  }

  private buildWhere(range: ReportRange): Prisma.OrderWhereInput {
    return {
      status: { in: [OrderStatus.HANDED_OVER, OrderStatus.READY, OrderStatus.PREPARING] },
      placedAt: { gte: range.from, lte: range.to },
      branchId: range.branchId,
      branch: range.merchantId ? { merchantId: range.merchantId } : undefined,
    };
  }
}
