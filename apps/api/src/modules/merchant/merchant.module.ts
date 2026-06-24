import { Module } from '@nestjs/common';
import { MerchantScopeService } from './merchant-scope.service';
import { MerchantMeController } from './controllers/merchant-me.controller';
import { MerchantBranchesController } from './controllers/merchant-branches.controller';
import { MerchantCategoriesController } from './controllers/merchant-categories.controller';
import { MerchantProductsController } from './controllers/merchant-products.controller';
import { MerchantOrdersController } from './controllers/merchant-orders.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [
    MerchantMeController,
    MerchantBranchesController,
    MerchantCategoriesController,
    MerchantProductsController,
    MerchantOrdersController,
  ],
  providers: [MerchantScopeService],
})
export class MerchantModule {}
