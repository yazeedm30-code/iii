import { Injectable } from '@nestjs/common';
import { NotificationCategory, NotificationChannel, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { PushService } from './push/push.service';

export interface SendNotificationInput {
  userId: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  title: string;
  body: string;
  deepLink?: string;
  payload?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  async send(input: SendNotificationInput) {
    const record = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        category: input.category,
        channel: input.channel,
        title: input.title,
        body: input.body,
        deepLink: input.deepLink,
        payload: input.payload,
        sentAt: new Date(),
      },
    });

    if (input.channel === NotificationChannel.PUSH) {
      const devices = await this.prisma.device.findMany({
        where: { customer: { userId: input.userId }, enabled: true },
        select: { pushToken: true },
      });
      await this.push.sendToTokens(devices.map((d) => d.pushToken), {
        title: input.title,
        body: input.body,
        deepLink: input.deepLink,
      });
    }

    return record;
  }

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
