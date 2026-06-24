import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CurrentUser, AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MerchantScopeService } from '../merchant-scope.service';
import { MerchantCreateCategoryDto } from '../dto/merchant.dto';

@ApiBearerAuth()
@ApiTags('merchant/categories')
@Roles(UserKind.MERCHANT)
@Controller({ path: 'merchant/categories', version: '1' })
export class MerchantCategoriesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: MerchantScopeService,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    return this.prisma.category.findMany({
      where: { merchantId },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MerchantCreateCategoryDto,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    return this.prisma.category.create({
      data: { ...dto, merchantId },
    });
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<MerchantCreateCategoryDto>,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    const result = await this.prisma.category.updateMany({
      where: { id, merchantId },
      data: dto,
    });
    if (result.count === 0) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND' });
    }
    return this.prisma.category.findUnique({ where: { id } });
  }
}
