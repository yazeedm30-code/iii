import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: [OrderStatus.PLACED, OrderStatus.CANCELLED],
  PLACED: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.HANDED_OVER, OrderStatus.CANCELLED],
  HANDED_OVER: [OrderStatus.REFUNDED],
  CANCELLED: [],
  REFUNDED: [],
};

@Injectable()
export class OrderStateMachine {
  assertCanTransition(from: OrderStatus, to: OrderStatus): void {
    if (!TRANSITIONS[from].includes(to)) {
      throw new BadRequestException({
        code: 'INVALID_ORDER_TRANSITION',
        message: `Cannot move order from ${from} to ${to}`,
      });
    }
  }

  nextStates(from: OrderStatus): OrderStatus[] {
    return TRANSITIONS[from];
  }
}
