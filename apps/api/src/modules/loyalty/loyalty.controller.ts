import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { LoyaltyService } from './loyalty.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('loyalty')
@Roles(UserKind.CUSTOMER)
@Controller({ path: 'loyalty', version: '1' })
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.loyalty.getOverview(user.userId);
  }
}
