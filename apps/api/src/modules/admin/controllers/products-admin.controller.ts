import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { AdminService } from '../admin.service';
import { CreateProductDto } from '../dto/admin.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('admin/products')
@Roles(UserKind.ADMIN, UserKind.MERCHANT)
@Controller({ path: 'admin/products', version: '1' })
export class ProductsAdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query('merchantId') merchantId?: string, @Query('categoryId') categoryId?: string) {
    return this.admin.prisma.product.findMany({
      where: { merchantId, categoryId, deletedAt: null },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.admin.prisma.product.create({ data: dto });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.admin.prisma.product.update({ where: { id }, data: dto });
  }
}
