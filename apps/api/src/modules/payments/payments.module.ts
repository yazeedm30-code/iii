import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeProvider } from './providers/stripe.provider';
import { ApplePayProvider } from './providers/apple-pay.provider';
import { MadaProvider } from './providers/mada.provider';
import { StcPayProvider } from './providers/stc-pay.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeProvider,
    ApplePayProvider,
    MadaProvider,
    StcPayProvider,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
