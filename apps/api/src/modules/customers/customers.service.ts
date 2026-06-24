import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateCustomerProfileDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: { user: true, loyaltyTier: true },
    });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });
    return this.serialize(customer);
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });

    const [updatedCustomer] = await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          avatarUrl: dto.avatarUrl,
          marketingOptIn: dto.marketingOptIn,
        },
        include: { user: true, loyaltyTier: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { preferredLocale: dto.preferredLocale },
      }),
    ]);
    return this.serialize(updatedCustomer);
  }

  private serialize(customer: Awaited<ReturnType<PrismaService['customer']['findUnique']>>) {
    if (!customer) return null;
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      displayName: customer.displayName,
      gender: customer.gender,
      avatarUrl: customer.avatarUrl,
      pointsBalance: customer.pointsBalance,
      lifetimePoints: customer.lifetimePoints,
      referralCode: customer.referralCode,
      marketingOptIn: customer.marketingOptIn,
      createdAt: customer.createdAt,
    };
  }
}
