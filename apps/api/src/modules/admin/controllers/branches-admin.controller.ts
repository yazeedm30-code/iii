import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { AdminService } from '../admin.service';
import { CreateBranchDto } from '../dto/admin.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('admin/branches')
@Roles(UserKind.ADMIN, UserKind.MERCHANT)
@Controller({ path: 'admin/branches', version: '1' })
export class BranchesAdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list() {
    return this.admin.prisma.branch.findMany({
      where: { deletedAt: null },
      include: { merchant: true, city: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.admin.prisma.branch.create({ data: dto });
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateBranchDto>) {
    return this.admin.prisma.branch.update({ where: { id }, data: dto });
  }
}
