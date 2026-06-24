import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { AdminService } from '../admin.service';
import { CreateCouponDto } from '../dto/admin.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('admin/coupons')
@Roles(UserKind.ADMIN, UserKind.MERCHANT)
@Controller({ path: 'admin/coupons', version: '1' })
export class CouponsAdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query('merchantId') merchantId?: string) {
    return this.admin.prisma.coupon.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.admin.prisma.coupon.create({ data: dto });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCouponDto>) {
    return this.admin.prisma.coupon.update({ where: { id }, data: dto });
  }
}
