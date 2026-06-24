import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class ApplePayProvider implements PaymentProvider {
  readonly name = 'apple-pay';

  async createIntent(_: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    return {
      providerReference: `ap_${randomUUID()}`,
      status: 'PENDING',
      payload: { merchantSession: 'pending' },
    };
  }
}
