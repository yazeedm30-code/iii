import { forwardRef, Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderPricingService } from './services/order-pricing.service';
import { OrderStateMachine } from './services/order-state-machine.service';
import { RealtimeModule } from '../../realtime/realtime.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [forwardRef(() => RealtimeModule), forwardRef(() => LoyaltyModule)],
  controllers: [OrdersController],
  providers: [OrdersService, OrderPricingService, OrderStateMachine],
  exports: [OrdersService, OrderStateMachine],
})
export class OrdersModule {}
