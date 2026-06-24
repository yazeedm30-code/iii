import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus, UserKind } from '@prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CurrentUser, AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { OrdersService } from '../../orders/orders.service';
import { MerchantScopeService } from '../merchant-scope.service';

class TransitionDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  toStatus!: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiBearerAuth()
@ApiTags('merchant/orders')
@Roles(UserKind.MERCHANT)
@Controller({ path: 'merchant/orders', version: '1' })
export class MerchantOrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
    private readonly scope: MerchantScopeService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    const merchantId = await this.scope.merchantIdForUser(user.userId);
    const statuses = status
      ? (status.split(',') as OrderStatus[])
      : [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY];
    return this.prisma.order.findMany({
      where: {
        branch: { merchantId },
        branchId,
        status: { in: statuses },
      },
      include: {
        items: true,
        branch: true,
        vehicle: true,
      },
      orderBy: { placedAt: 'asc' },
      take: 100,
    });
  }

  @Patch(':id/status')
  async transition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionDto,
  ) {
    await this.scope.merchantIdForUser(user.userId);
    return this.orders.transition(id, dto.toStatus, { note: dto.note });
  }
}
