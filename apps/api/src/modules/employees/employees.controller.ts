import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, UserKind } from '@prisma/client';

import { EmployeesService } from './employees.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/pagination/pagination.dto';

class TransitionOrderDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  toStatus!: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiBearerAuth()
@ApiTags('employee')
@Roles(UserKind.EMPLOYEE)
@Controller({ path: 'employee', version: '1' })
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Post('shifts/start')
  startShift(@CurrentUser() user: AuthenticatedUser) {
    return this.employees.startShift(user.userId);
  }

  @Post('shifts/end')
  endShift(@CurrentUser() user: AuthenticatedUser) {
    return this.employees.endShift(user.userId);
  }

  @Get('queue')
  queue(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.employees.branchQueue(user.userId, query);
  }

  @Patch('orders/:orderId/status')
  transition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: TransitionOrderDto,
  ) {
    return this.employees.transitionOrder(user.userId, orderId, dto.toStatus, dto.note);
  }
}
