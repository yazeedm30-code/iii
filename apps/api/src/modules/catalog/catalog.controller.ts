import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('catalog')
@Controller({ path: 'branches/:branchId', version: '1' })
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get('menu')
  getMenu(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query('search') search?: string,
  ) {
    return this.catalog.getMenu(branchId, search);
  }

  @Public()
  @Get('products/:productId')
  getProduct(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.catalog.getProduct(branchId, productId);
  }
}
