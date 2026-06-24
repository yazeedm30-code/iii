import { Module } from '@nestjs/common';
import { MerchantsAdminController } from './controllers/merchants-admin.controller';
import { BranchesAdminController } from './controllers/branches-admin.controller';
import { ProductsAdminController } from './controllers/products-admin.controller';
import { CategoriesAdminController } from './controllers/categories-admin.controller';
import { CouponsAdminController } from './controllers/coupons-admin.controller';
import { OnboardingAdminController } from './controllers/onboarding-admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    MerchantsAdminController,
    BranchesAdminController,
    ProductsAdminController,
    CategoriesAdminController,
    CouponsAdminController,
    OnboardingAdminController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
