import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BranchesService } from './branches.service';
import { BranchQueryDto } from './dto/branch-query.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('branches')
@Controller({ path: 'branches', version: '1' })
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Public()
  @Get()
  list(@Query() query: BranchQueryDto) {
    return this.branches.list(query);
  }

  @Public()
  @Get(':id')
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.branches.getById(id);
  }
}
