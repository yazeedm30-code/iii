import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class StcPayProvider implements PaymentProvider {
  readonly name = 'stc-pay';

  async createIntent(_: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    return {
      providerReference: `stc_${randomUUID()}`,
      status: 'PENDING',
      payload: { otpRequired: true },
    };
  }
}
