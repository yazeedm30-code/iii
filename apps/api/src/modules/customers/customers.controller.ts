import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserKind } from '@prisma/client';

import { CustomersService } from './customers.service';
import { UpdateCustomerProfileDto } from './dto/customer.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('customers')
@Roles(UserKind.CUSTOMER)
@Controller({ path: 'me', version: '1' })
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.customers.getProfile(user.userId);
  }

  @Patch()
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateCustomerProfileDto) {
    return this.customers.updateProfile(user.userId, dto);
  }
}
