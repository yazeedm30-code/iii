import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { AppConfigService } from '../config/app-config.service';

interface OrderUpdatePayload {
  orderId: string;
  number: string;
  branchId: string;
  customerId: string;
  status: OrderStatus;
  updatedAt: Date;
}

interface ArrivalPayload {
  orderId: string;
  branchId: string;
  distance: number;
  atBranch: boolean;
}

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ?? client.handshake.headers['authorization']?.toString();
      if (!token) {
        client.disconnect(true);
        return;
      }
      const stripped = token.replace(/^Bearer\s+/i, '');
      const payload = await this.jwt.verifyAsync<{ sub: string; kind: string }>(stripped, {
        secret: this.config.jwtAccessSecret,
      });
      client.data.userId = payload.sub;
      client.data.kind = payload.kind;
      client.join(`user:${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Rejected socket connection: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(_: Socket): void {}

  @SubscribeMessage('subscribe:branch')
  subscribeBranch(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { branchId: string },
  ): { ok: true } {
    client.join(`branch:${body.branchId}`);
    return { ok: true };
  }

  @SubscribeMessage('subscribe:kds')
  subscribeKds(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { branchId: string },
  ): { ok: true } {
    client.join(`kds:${body.branchId}`);
    return { ok: true };
  }

  @SubscribeMessage('subscribe:order')
  subscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { orderId: string },
  ): { ok: true } {
    client.join(`order:${body.orderId}`);
    return { ok: true };
  }

  broadcastOrderUpdate(
    order: Order & { items?: unknown; events?: unknown; payments?: unknown },
  ): void {
    const payload: OrderUpdatePayload = {
      orderId: order.id,
      number: order.number,
      branchId: order.branchId,
      customerId: order.customerId,
      status: order.status,
      updatedAt: order.updatedAt,
    };
    this.server.to(`branch:${order.branchId}`).emit('order:update', payload);
    this.server.to(`kds:${order.branchId}`).emit('order:update', payload);
    this.server.to(`order:${order.id}`).emit('order:update', payload);
    this.server.to(`user:${order.customerId}`).emit('order:update', payload);
  }

  broadcastArrival(payload: ArrivalPayload): void {
    this.server.to(`branch:${payload.branchId}`).emit('order:arrival', payload);
    this.server.to(`kds:${payload.branchId}`).emit('order:arrival', payload);
    this.server.to(`order:${payload.orderId}`).emit('order:arrival', payload);
  }

  broadcastBranchDisplay(branchId: string, snapshot: Prisma.JsonValue): void {
    this.server.to(`branch-display:${branchId}`).emit('display:update', snapshot);
  }
}
