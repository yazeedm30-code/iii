import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { PaginationQueryDto } from '../../common/pagination/pagination.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  async startShift(userId: string) {
    const employee = await this.requireEmployee(userId);
    return this.prisma.shift.create({
      data: { employeeId: employee.id, startedAt: new Date() },
    });
  }

  async endShift(userId: string) {
    const employee = await this.requireEmployee(userId);
    const active = await this.prisma.shift.findFirst({
      where: { employeeId: employee.id, endedAt: null },
      orderBy: { startedAt: 'desc' },
    });
    if (!active) throw new NotFoundException({ code: 'NO_ACTIVE_SHIFT' });
    return this.prisma.shift.update({
      where: { id: active.id },
      data: { endedAt: new Date() },
    });
  }

  async branchQueue(userId: string, query: PaginationQueryDto) {
    const employee = await this.requireEmployee(userId);
    return this.orders.listForBranch(employee.branchId, query);
  }

  async transitionOrder(userId: string, orderId: string, nextStatus: OrderStatus, note?: string) {
    const employee = await this.requireEmployee(userId);
    return this.orders.transition(orderId, nextStatus, { employeeId: employee.id, note });
  }

  private async requireEmployee(userId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException({ code: 'EMPLOYEE_NOT_FOUND' });
    return employee;
  }
}
