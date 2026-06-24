import { Injectable, NotFoundException } from '@nestjs/common';
import { LoyaltyTransactionKind, Order, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: { loyaltyTier: true },
    });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });

    const recentTxns = await this.prisma.loyaltyTransaction.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const tiers = await this.prisma.loyaltyTier.findMany({
      orderBy: { threshold: 'asc' },
    });
    const nextTier = tiers.find((tier) => tier.threshold > customer.lifetimePoints);

    return {
      pointsBalance: customer.pointsBalance,
      lifetimePoints: customer.lifetimePoints,
      currentTier: customer.loyaltyTier,
      nextTier,
      pointsToNextTier: nextTier ? nextTier.threshold - customer.lifetimePoints : 0,
      recentTransactions: recentTxns,
    };
  }

  async accruePoints(order: Order): Promise<void> {
    const program = await this.prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!program) return;

    const customer = await this.prisma.customer.findUnique({
      where: { id: order.customerId },
      include: { loyaltyTier: true },
    });
    if (!customer) return;

    const multiplier = customer.loyaltyTier?.multiplier ?? new Prisma.Decimal(1);
    const pointsEarned = Math.floor(
      Number(order.totalAmount.mul(program.earnRatio).mul(multiplier).toFixed(0)),
    );
    if (pointsEarned <= 0) return;

    const balanceAfter = customer.pointsBalance + pointsEarned;

    await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          pointsBalance: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          orderId: order.id,
          kind: LoyaltyTransactionKind.EARN,
          points: pointsEarned,
          balanceAfter,
          reference: order.number,
          expiresAt: program.pointsExpiryDays
            ? new Date(Date.now() + program.pointsExpiryDays * 86_400_000)
            : null,
        },
      }),
      this.prisma.order.update({
        where: { id: order.id },
        data: { pointsEarned },
      }),
    ]);

    await this.evaluateTier(customer.id);
  }

  async redeemPoints(
    tx: Prisma.TransactionClient,
    customerId: string,
    points: number,
    orderId: string,
  ): Promise<void> {
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer || customer.pointsBalance < points) return;

    const balanceAfter = customer.pointsBalance - points;
    await tx.customer.update({
      where: { id: customerId },
      data: { pointsBalance: { decrement: points } },
    });
    await tx.loyaltyTransaction.create({
      data: {
        customerId,
        orderId,
        kind: LoyaltyTransactionKind.REDEEM,
        points: -points,
        balanceAfter,
      },
    });
  }

  private async evaluateTier(customerId: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return;
    const tier = await this.prisma.loyaltyTier.findFirst({
      where: { threshold: { lte: customer.lifetimePoints } },
      orderBy: { threshold: 'desc' },
    });
    if (tier && tier.id !== customer.loyaltyTierId) {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { loyaltyTierId: tier.id },
      });
    }
  }
}
