import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { haversineDistanceMeters } from '../../common/utils/geo.util';
import { ArrivalPingDto } from './dto/pickup.dto';

@Injectable()
export class PickupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async reportArrivalPing(userId: string, orderId: string, dto: ArrivalPingDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { branch: true, customer: { include: { user: true } } },
    });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND' });
    if (order.customer.user.id !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN' });
    }

    const distance = Math.round(
      haversineDistanceMeters(
        { latitude: dto.latitude, longitude: dto.longitude },
        { latitude: Number(order.branch.latitude), longitude: Number(order.branch.longitude) },
      ),
    );
    const isAtBranch = distance <= order.branch.arrivalRadiusM;

    const signal = await this.prisma.arrivalSignal.create({
      data: {
        orderId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        distanceMeters: distance,
        isAtBranch,
        source: (dto.source ?? 'GPS').toUpperCase(),
      },
    });

    if (isAtBranch && !order.customerArrivedAt) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { customerArrivedAt: new Date() },
      });
      this.realtime.broadcastArrival({
        orderId,
        branchId: order.branchId,
        distance,
        atBranch: true,
      });
    }

    return { distance, atBranch: isAtBranch, signalId: signal.id };
  }

  async markArrived(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { include: { user: true } } },
    });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND' });
    if (order.customer.user.id !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN' });
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { customerArrivedAt: order.customerArrivedAt ?? new Date() },
    });

    this.realtime.broadcastArrival({
      orderId,
      branchId: updated.branchId,
      distance: 0,
      atBranch: true,
    });
    return { arrivedAt: updated.customerArrivedAt };
  }
}
