import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { CitiesController } from './cities.controller';

@Module({
  controllers: [BranchesController, CitiesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
