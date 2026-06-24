import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';

const ZERO = new Prisma.Decimal(0);

export interface PricedItem {
  productId: string;
  productName: string;
  productNameAr: string;
  productImage: string | null;
  unitPrice: Prisma.Decimal;
  quantity: number;
  modifiersTotal: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
  notes?: string;
  taxRate: Prisma.Decimal;
  modifiers: Array<{
    optionId: string;
    name: string;
    nameAr: string;
    priceDelta: Prisma.Decimal;
  }>;
}

export interface PricedOrder {
  items: PricedItem[];
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  loyaltyAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  couponId?: string;
  pointsRedeemed: number;
}

@Injectable()
export class OrderPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async price(dto: CreateOrderDto, customerId: string): Promise<PricedOrder> {
    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
      include: {
        availability: { where: { branchId: dto.branchId } },
        modifierGroups: { include: { options: true } },
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items: PricedItem[] = [];
    let subtotal = ZERO;
    let taxAmount = ZERO;

    for (const line of dto.items) {
      const product = productMap.get(line.productId);
      if (!product) {
        throw new NotFoundException({
          code: 'PRODUCT_NOT_FOUND',
          message: `Product ${line.productId} not found`,
        });
      }
      const availability = product.availability[0];
      if (!availability || !availability.isAvailable) {
        throw new BadRequestException({
          code: 'PRODUCT_UNAVAILABLE',
          message: `${product.nameAr} unavailable at this branch`,
        });
      }

      const unitPrice = new Prisma.Decimal(availability.priceOverride ?? product.basePrice);

      const selectedOptions = (line.modifierOptionIds ?? []).map((optionId) => {
        for (const group of product.modifierGroups) {
          const option = group.options.find((o) => o.id === optionId);
          if (option) return { group, option };
        }
        throw new BadRequestException({
          code: 'INVALID_MODIFIER',
          message: `Modifier option ${optionId} is not valid for this product`,
        });
      });

      for (const group of product.modifierGroups) {
        const picked = selectedOptions.filter((s) => s.group.id === group.id).length;
        if (picked < group.minSelections || picked > group.maxSelections) {
          throw new BadRequestException({
            code: 'MODIFIER_RULE_VIOLATION',
            message: `Selection for ${group.nameAr} is out of range`,
          });
        }
      }

      const modifiersTotal = selectedOptions.reduce(
        (sum, s) => sum.plus(new Prisma.Decimal(s.option.priceDelta)),
        ZERO,
      );
      const lineSubtotal = unitPrice.plus(modifiersTotal).mul(line.quantity);
      const lineTax = lineSubtotal.mul(product.taxRate);

      items.push({
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        productImage: product.imageUrl,
        unitPrice,
        quantity: line.quantity,
        modifiersTotal,
        lineTotal: lineSubtotal,
        notes: line.notes,
        taxRate: new Prisma.Decimal(product.taxRate),
        modifiers: selectedOptions.map(({ option }) => ({
          optionId: option.id,
          name: option.name,
          nameAr: option.nameAr,
          priceDelta: new Prisma.Decimal(option.priceDelta),
        })),
      });

      subtotal = subtotal.plus(lineSubtotal);
      taxAmount = taxAmount.plus(lineTax);
    }

    const { discountAmount, couponId } = await this.applyCoupon(dto.couponCode, customerId, subtotal);

    const { loyaltyAmount, pointsRedeemed } = await this.applyLoyalty(
      customerId,
      dto.pointsToRedeem ?? 0,
      subtotal.minus(discountAmount),
    );

    const totalAmount = subtotal
      .plus(taxAmount)
      .minus(discountAmount)
      .minus(loyaltyAmount)
      .toDecimalPlaces(2);

    if (totalAmount.lessThan(0)) {
      throw new BadRequestException({ code: 'NEGATIVE_TOTAL' });
    }

    return {
      items,
      subtotal: subtotal.toDecimalPlaces(2),
      taxAmount: taxAmount.toDecimalPlaces(2),
      discountAmount: discountAmount.toDecimalPlaces(2),
      loyaltyAmount: loyaltyAmount.toDecimalPlaces(2),
      totalAmount,
      couponId,
      pointsRedeemed,
    };
  }

  private async applyCoupon(
    code: string | undefined,
    customerId: string,
    subtotal: Prisma.Decimal,
  ): Promise<{ discountAmount: Prisma.Decimal; couponId?: string }> {
    if (!code) return { discountAmount: ZERO };

    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException({ code: 'COUPON_INVALID' });
    }
    const now = new Date();
    if ((coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) {
      throw new BadRequestException({ code: 'COUPON_EXPIRED' });
    }
    if (coupon.minSubtotal && subtotal.lessThan(coupon.minSubtotal)) {
      throw new BadRequestException({ code: 'COUPON_MIN_NOT_MET' });
    }
    if (coupon.perCustomerLimit) {
      const used = await this.prisma.couponGrant.count({
        where: { couponId: coupon.id, customerId, redeemedAt: { not: null } },
      });
      if (used >= coupon.perCustomerLimit) {
        throw new BadRequestException({ code: 'COUPON_LIMIT_REACHED' });
      }
    }

    let discount = ZERO;
    if (coupon.type === CouponType.PERCENT) {
      discount = subtotal.mul(new Prisma.Decimal(coupon.value).div(100));
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount = new Prisma.Decimal(coupon.value);
    }
    if (coupon.maxDiscount && discount.greaterThan(coupon.maxDiscount)) {
      discount = new Prisma.Decimal(coupon.maxDiscount);
    }
    return { discountAmount: discount, couponId: coupon.id };
  }

  private async applyLoyalty(
    customerId: string,
    points: number,
    netSubtotal: Prisma.Decimal,
  ): Promise<{ loyaltyAmount: Prisma.Decimal; pointsRedeemed: number }> {
    if (points <= 0) return { loyaltyAmount: ZERO, pointsRedeemed: 0 };

    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { loyaltyAmount: ZERO, pointsRedeemed: 0 };
    const program = await this.prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!program) return { loyaltyAmount: ZERO, pointsRedeemed: 0 };

    const usable = Math.min(points, customer.pointsBalance);
    let value = new Prisma.Decimal(usable).mul(program.redeemValue);
    if (value.greaterThan(netSubtotal)) {
      const cappedPoints = Math.floor(
        Number(netSubtotal.div(program.redeemValue).toFixed(0)),
      );
      value = new Prisma.Decimal(cappedPoints).mul(program.redeemValue);
      return { loyaltyAmount: value, pointsRedeemed: cappedPoints };
    }
    return { loyaltyAmount: value, pointsRedeemed: usable };
  }
}
