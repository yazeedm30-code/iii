import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { AppConfigService } from '../../../config/app-config.service';
import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger(StripeProvider.name);
  private stripe?: Stripe;

  constructor(private readonly config: AppConfigService) {
    const key = this.config.stripeSecretKey;
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2024-09-30.acacia' });
    }
  }

  async createIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured, returning mock intent');
      return {
        providerReference: `mock_${request.orderId}`,
        status: 'AUTHORIZED',
        clientSecret: 'mock_secret',
      };
    }
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(request.amount.mul(100).toNumber()),
      currency: request.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: request.orderId, customerId: request.customerId },
    });
    return {
      providerReference: intent.id,
      status: 'PENDING',
      clientSecret: intent.client_secret ?? undefined,
    };
  }
}
