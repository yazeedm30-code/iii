import { Prisma } from '@prisma/client';

export interface PaymentIntentRequest {
  orderId: string;
  amount: Prisma.Decimal;
  currency: string;
  customerId: string;
  providerToken?: string;
}

export interface PaymentIntentResponse {
  providerReference: string;
  status: 'AUTHORIZED' | 'CAPTURED' | 'PENDING' | 'FAILED';
  clientSecret?: string;
  redirectUrl?: string;
  payload?: Record<string, unknown>;
  failureReason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse>;
}
