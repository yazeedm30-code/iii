import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CurrentUser, AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MerchantScopeService } from '../merchant-scope.service';
import { MerchantCreateBranchDto } from '../dto/merchant.dto';

@ApiBearerAuth()
@ApiTags('merchant/branches')
@Roles(UserKind.MERCHANT)
@Controller({ path: 'merchant/branches', version: '1' })
export class MerchantBranchesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: MerchantScopeService,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    return this.prisma.branch.findMany({
      where: { merchantId, deletedAt: null },
      include: { city: true, _count: { select: { orders: true, productAvail: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MerchantCreateBranchDto,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    return this.prisma.branch.create({
      data: {
        merchantId,
        cityId: dto.cityId,
        name: dto.name,
        nameAr: dto.nameAr,
        code: dto.code,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        arrivalRadiusM: dto.arrivalRadiusM,
        averagePrepMin: dto.averagePrepMin,
        supportsDriveThru: dto.supportsDriveThru ?? true,
        supportsPickup: dto.supportsPickup ?? true,
      },
    });
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<MerchantCreateBranchDto>,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    const result = await this.prisma.branch.updateMany({
      where: { id, merchantId, deletedAt: null },
      data: dto,
    });
    if (result.count === 0) {
      throw new Error('BRANCH_NOT_FOUND');
    }
    return this.prisma.branch.findUnique({ where: { id } });
  }
}
