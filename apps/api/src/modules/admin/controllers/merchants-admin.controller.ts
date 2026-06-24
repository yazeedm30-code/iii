import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { AdminService } from '../admin.service';
import { CreateMerchantDto } from '../dto/admin.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('admin/merchants')
@Roles(UserKind.ADMIN)
@Controller({ path: 'admin/merchants', version: '1' })
export class MerchantsAdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list() {
    return this.admin.prisma.merchant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  create(@Body() dto: CreateMerchantDto) {
    return this.admin.prisma.merchant.create({ data: dto });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateMerchantDto>) {
    return this.admin.prisma.merchant.update({ where: { id }, data: dto });
  }
}
