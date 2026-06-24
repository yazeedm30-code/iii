import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderStateMachine } from './order-state-machine.service';

describe('OrderStateMachine', () => {
  const machine = new OrderStateMachine();

  it('allows the happy path PLACED → ACCEPTED → PREPARING → READY → HANDED_OVER', () => {
    expect(() => machine.assertCanTransition(OrderStatus.PLACED, OrderStatus.ACCEPTED)).not.toThrow();
    expect(() =>
      machine.assertCanTransition(OrderStatus.ACCEPTED, OrderStatus.PREPARING),
    ).not.toThrow();
    expect(() =>
      machine.assertCanTransition(OrderStatus.PREPARING, OrderStatus.READY),
    ).not.toThrow();
    expect(() =>
      machine.assertCanTransition(OrderStatus.READY, OrderStatus.HANDED_OVER),
    ).not.toThrow();
  });

  it('rejects backwards transitions', () => {
    expect(() => machine.assertCanTransition(OrderStatus.READY, OrderStatus.PLACED)).toThrow(
      BadRequestException,
    );
  });

  it('terminal states have no outgoing transitions', () => {
    expect(machine.nextStates(OrderStatus.CANCELLED)).toHaveLength(0);
    expect(machine.nextStates(OrderStatus.REFUNDED)).toHaveLength(0);
  });
});
