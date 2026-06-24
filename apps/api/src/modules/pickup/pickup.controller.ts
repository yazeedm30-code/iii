import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { PickupService } from './pickup.service';
import { ArrivalPingDto } from './dto/pickup.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('pickup')
@Roles(UserKind.CUSTOMER)
@Controller({ path: 'orders/:orderId/pickup', version: '1' })
export class PickupController {
  constructor(private readonly pickup: PickupService) {}

  @Post('ping')
  ping(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: ArrivalPingDto,
  ) {
    return this.pickup.reportArrivalPing(user.userId, orderId, dto);
  }

  @Post('arrived')
  arrived(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.pickup.markArrived(user.userId, orderId);
  }
}
