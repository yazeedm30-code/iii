import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { InitiatePaymentDto } from './dto/payment.dto';
import { PaymentProvider } from './providers/payment-provider.interface';
import { StripeProvider } from './providers/stripe.provider';
import { ApplePayProvider } from './providers/apple-pay.provider';
import { MadaProvider } from './providers/mada.provider';
import { StcPayProvider } from './providers/stc-pay.provider';

@Injectable()
export class PaymentsService {
  private readonly providers: Record<PaymentMethod, PaymentProvider | undefined>;

  constructor(
    private readonly prisma: PrismaService,
    stripe: StripeProvider,
    apple: ApplePayProvider,
    mada: MadaProvider,
    stc: StcPayProvider,
  ) {
    this.providers = {
      APPLE_PAY: apple,
      GOOGLE_PAY: stripe,
      MADA: mada,
      STC_PAY: stc,
      CARD: stripe,
      CASH: undefined,
      LOYALTY_POINTS: undefined,
      WALLET: undefined,
    };
  }

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { customer: { include: { user: true } } },
    });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND' });
    if (order.customer.user.id !== userId) {
      throw new BadRequestException({ code: 'ORDER_OWNERSHIP_MISMATCH' });
    }

    if (dto.method === PaymentMethod.CASH) {
      return this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.CASH,
          status: PaymentStatus.PENDING,
          amount: order.totalAmount,
        },
      });
    }

    const provider = this.providers[dto.method];
    if (!provider) {
      throw new BadRequestException({ code: 'PAYMENT_METHOD_UNSUPPORTED' });
    }

    const intent = await provider.createIntent({
      orderId: order.id,
      amount: order.totalAmount,
      currency: order.currency,
      customerId: order.customerId,
      providerToken: dto.providerToken,
    });

    return this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: dto.method,
        status:
          intent.status === 'AUTHORIZED'
            ? PaymentStatus.AUTHORIZED
            : intent.status === 'CAPTURED'
              ? PaymentStatus.CAPTURED
              : PaymentStatus.PENDING,
        amount: order.totalAmount,
        providerName: provider.name,
        providerReference: intent.providerReference,
        providerPayload: (intent.payload ?? {}) as object,
      },
    });
  }
}
