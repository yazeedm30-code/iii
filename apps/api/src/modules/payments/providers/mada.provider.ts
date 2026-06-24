import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class MadaProvider implements PaymentProvider {
  readonly name = 'mada';

  async createIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    return {
      providerReference: `mada_${randomUUID()}`,
      status: 'PENDING',
      redirectUrl: `https://checkout.mada.example/${request.orderId}`,
    };
  }
}
