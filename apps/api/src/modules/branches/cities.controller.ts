import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('cities')
@Controller({ path: 'cities', version: '1' })
export class CitiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  list() {
    return this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: { nameAr: 'asc' },
    });
  }
}
