import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CurrentUser, AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MerchantScopeService } from '../merchant-scope.service';

@ApiBearerAuth()
@ApiTags('merchant')
@Roles(UserKind.MERCHANT)
@Controller({ path: 'merchant/me', version: '1' })
export class MerchantMeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: MerchantScopeService,
  ) {}

  @Get()
  async me(@CurrentUser() user: AuthenticatedUser) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        _count: { select: { branches: true, products: true, categories: true } },
      },
    });
    return {
      id: merchant!.id,
      name: merchant!.name,
      nameAr: merchant!.nameAr,
      slug: merchant!.slug,
      logoUrl: merchant!.logoUrl,
      primaryColor: merchant!.primaryColor,
      vatNumber: merchant!.vatNumber,
      crNumber: merchant!.crNumber,
      counts: merchant!._count,
    };
  }
}
