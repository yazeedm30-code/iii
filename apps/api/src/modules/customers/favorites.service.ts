import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const customer = await this.requireCustomer(userId);
    return this.prisma.favorite.findMany({
      where: { customerId: customer.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: string) {
    const customer = await this.requireCustomer(userId);
    return this.prisma.favorite.upsert({
      where: { customerId_productId: { customerId: customer.id, productId } },
      create: { customerId: customer.id, productId },
      update: {},
    });
  }

  async remove(userId: string, productId: string) {
    const customer = await this.requireCustomer(userId);
    await this.prisma.favorite.deleteMany({
      where: { customerId: customer.id, productId },
    });
  }

  private async requireCustomer(userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });
    return customer;
  }
}
