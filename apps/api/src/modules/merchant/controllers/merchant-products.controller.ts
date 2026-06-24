import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CurrentUser, AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MerchantScopeService } from '../merchant-scope.service';
import { MerchantCreateProductDto, MerchantUpdateProductDto } from '../dto/merchant.dto';

@ApiBearerAuth()
@ApiTags('merchant/products')
@Roles(UserKind.MERCHANT)
@Controller({ path: 'merchant/products', version: '1' })
export class MerchantProductsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: MerchantScopeService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('categoryId') categoryId?: string,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    return this.prisma.product.findMany({
      where: { merchantId, deletedAt: null, categoryId },
      include: { category: true, _count: { select: { availability: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MerchantCreateProductDto,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, merchantId },
    });
    if (!category) {
      throw new BadRequestException({ code: 'CATEGORY_NOT_FOUND' });
    }
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          merchantId,
          categoryId: dto.categoryId,
          sku: dto.sku,
          name: dto.name,
          nameAr: dto.nameAr,
          description: dto.description,
          descriptionAr: dto.descriptionAr,
          imageUrl: dto.imageUrl,
          basePrice: dto.basePrice,
          taxRate: dto.taxRate ?? 0.15,
          calories: dto.calories,
          prepSeconds: dto.prepSeconds ?? 180,
        },
      });
      const branches = await tx.branch.findMany({
        where: { merchantId, deletedAt: null },
        select: { id: true },
      });
      if (branches.length > 0) {
        await tx.branchProduct.createMany({
          data: branches.map((b) => ({
            branchId: b.id,
            productId: product.id,
            isAvailable: true,
          })),
        });
      }
      return product;
    });
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MerchantUpdateProductDto,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    const result = await this.prisma.product.updateMany({
      where: { id, merchantId, deletedAt: null },
      data: dto,
    });
    if (result.count === 0) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND' });
    }
    return this.prisma.product.findUnique({ where: { id } });
  }
}
