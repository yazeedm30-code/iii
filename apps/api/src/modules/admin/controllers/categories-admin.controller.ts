import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { AdminService } from '../admin.service';
import { CreateCategoryDto } from '../dto/admin.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('admin/categories')
@Roles(UserKind.ADMIN, UserKind.MERCHANT)
@Controller({ path: 'admin/categories', version: '1' })
export class CategoriesAdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list(@Query('merchantId') merchantId?: string) {
    return this.admin.prisma.category.findMany({
      where: { merchantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.admin.prisma.category.create({ data: dto });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.admin.prisma.category.update({ where: { id }, data: dto });
  }
}
