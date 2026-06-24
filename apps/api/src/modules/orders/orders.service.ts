import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPricingService } from './services/order-pricing.service';
import { OrderStateMachine } from './services/order-state-machine.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { LoyaltyService } from '../loyalty/loyalty.service';
import {
  generateOrderNumber,
  generatePickupCode,
} from '../../common/utils/code-generator.util';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/pagination/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: OrderPricingService,
    private readonly stateMachine: OrderStateMachine,
    private readonly realtime: RealtimeGateway,
    private readonly loyalty: LoyaltyService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });

    const priced = await this.pricing.price(dto, customer.id);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number: generateOrderNumber(),
          customerId: customer.id,
          branchId: dto.branchId,
          vehicleId: dto.vehicleId,
          fulfillment: dto.fulfillment,
          channel: 'CUSTOMER_APP',
          status: OrderStatus.PLACED,
          scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
          notes: dto.notes,
          subtotal: priced.subtotal,
          taxAmount: priced.taxAmount,
          discountAmount: priced.discountAmount,
          loyaltyAmount: priced.loyaltyAmount,
          totalAmount: priced.totalAmount,
          pointsRedeemed: priced.pointsRedeemed,
          couponId: priced.couponId,
          pickupCode: generatePickupCode(),
          placedAt: new Date(),
          items: {
            create: priced.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              modifiersTotal: item.modifiersTotal,
              lineTotal: item.lineTotal,
              notes: item.notes,
              snapshot: {
                name: item.productName,
                nameAr: item.productNameAr,
                imageUrl: item.productImage,
                taxRate: item.taxRate.toNumber(),
                modifiers: item.modifiers.map((m) => ({
                  optionId: m.optionId,
                  name: m.name,
                  nameAr: m.nameAr,
                  priceDelta: m.priceDelta.toNumber(),
                })),
              } as Prisma.InputJsonValue,
              modifiers: {
                create: item.modifiers.map((m) => ({
                  optionId: m.optionId,
                  nameSnapshot: m.nameAr,
                  priceDelta: m.priceDelta,
                })),
              },
            })),
          },
          events: {
            create: { toStatus: OrderStatus.PLACED, note: 'Order placed by customer' },
          },
        },
        include: this.fullInclude(),
      });

      if (priced.pointsRedeemed > 0) {
        await this.loyalty.redeemPoints(tx, customer.id, priced.pointsRedeemed, created.id);
      }

      if (priced.couponId) {
        await tx.couponGrant.upsert({
          where: { couponId_customerId: { couponId: priced.couponId, customerId: customer.id } },
          create: { couponId: priced.couponId, customerId: customer.id, redeemedAt: new Date() },
          update: { redeemedAt: new Date() },
        });
      }

      return created;
    });

    this.realtime.broadcastOrderUpdate(order);

    return order;
  }

  async listForCustomer(userId: string, query: PaginationQueryDto): Promise<PaginatedResult<unknown>> {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });

    const where: Prisma.OrderWhereInput = { customerId: customer.id };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: this.fullInclude(),
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(items, totalItems, query);
  }

  async getById(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.fullInclude(),
    });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND' });

    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer || customer.id !== order.customerId) {
      throw new ForbiddenException({ code: 'FORBIDDEN' });
    }
    return order;
  }

  async transition(
    orderId: string,
    nextStatus: OrderStatus,
    actor: { employeeId?: string; note?: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND' });

    this.stateMachine.assertCanTransition(order.status, nextStatus);

    const now = new Date();
    const stamp: Prisma.OrderUpdateInput = { status: nextStatus };
    if (nextStatus === OrderStatus.ACCEPTED) stamp.acceptedAt = now;
    if (nextStatus === OrderStatus.READY) stamp.readyAt = now;
    if (nextStatus === OrderStatus.HANDED_OVER) stamp.handedOverAt = now;
    if (nextStatus === OrderStatus.CANCELLED) stamp.cancelledAt = now;

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        ...stamp,
        events: {
          create: {
            fromStatus: order.status,
            toStatus: nextStatus,
            employeeId: actor.employeeId,
            note: actor.note,
          },
        },
      },
      include: this.fullInclude(),
    });

    if (nextStatus === OrderStatus.HANDED_OVER) {
      await this.loyalty.accruePoints(updated);
    }

    this.realtime.broadcastOrderUpdate(updated);
    return updated;
  }

  async listForBranch(branchId: string, query: PaginationQueryDto) {
    const where: Prisma.OrderWhereInput = {
      branchId,
      status: { in: [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY] },
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: this.fullInclude(),
        orderBy: { placedAt: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginate(items, totalItems, query);
  }

  private fullInclude(): Prisma.OrderInclude {
    return {
      items: { include: { modifiers: true } },
      events: { orderBy: { createdAt: 'asc' } },
      vehicle: true,
      branch: true,
      payments: true,
    };
  }
}
