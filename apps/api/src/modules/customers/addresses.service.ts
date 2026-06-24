import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDto } from './dto/customer.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const customer = await this.requireCustomer(userId);
    return this.prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    const customer = await this.requireCustomer(userId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { customerId: customer.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: {
          customerId: customer.id,
          label: dto.label,
          cityId: dto.cityId,
          district: dto.district,
          street: dto.street,
          buildingNumber: dto.buildingNumber,
          latitude: dto.latitude,
          longitude: dto.longitude,
          notes: dto.notes,
          isDefault: dto.isDefault ?? false,
        },
      });
    });
  }

  async remove(userId: string, id: string) {
    const customer = await this.requireCustomer(userId);
    const result = await this.prisma.address.deleteMany({
      where: { id, customerId: customer.id },
    });
    if (result.count === 0) throw new NotFoundException({ code: 'ADDRESS_NOT_FOUND' });
  }

  private async requireCustomer(userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });
    return customer;
  }
}
