import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVehicleDto } from './dto/customer.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const customer = await this.requireCustomer(userId);
    return this.prisma.vehicle.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateVehicleDto) {
    const customer = await this.requireCustomer(userId);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.vehicle.updateMany({
          where: { customerId: customer.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.vehicle.create({
        data: {
          customerId: customer.id,
          make: dto.make,
          model: dto.model,
          color: dto.color,
          plateNumber: dto.plateNumber,
          plateLetters: dto.plateLetters,
          isDefault: dto.isDefault ?? false,
        },
      });
    });
  }

  async remove(userId: string, id: string) {
    const customer = await this.requireCustomer(userId);
    const result = await this.prisma.vehicle.deleteMany({
      where: { id, customerId: customer.id },
    });
    if (result.count === 0) throw new NotFoundException({ code: 'VEHICLE_NOT_FOUND' });
  }

  private async requireCustomer(userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND' });
    return customer;
  }
}
