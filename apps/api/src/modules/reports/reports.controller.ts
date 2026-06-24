import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { UserKind } from '@prisma/client';

import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';

class ReportQueryDto {
  @Type(() => Date)
  @IsDate()
  from!: Date;

  @Type(() => Date)
  @IsDate()
  to!: Date;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  merchantId?: string;
}

@ApiBearerAuth()
@ApiTags('reports')
@Roles(UserKind.ADMIN, UserKind.MERCHANT, UserKind.EMPLOYEE)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('sales')
  sales(@Query() q: ReportQueryDto) {
    return this.reports.salesSummary(q);
  }

  @Get('hourly')
  hourly(@Query() q: ReportQueryDto) {
    return this.reports.hourlyDistribution(q);
  }

  @Get('top-products')
  topProducts(@Query() q: ReportQueryDto) {
    return this.reports.topProducts(q);
  }

  @Get('branches')
  branches(@Query() q: ReportQueryDto) {
    return this.reports.branchPerformance(q);
  }
}
