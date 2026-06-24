import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  controllers: [
    CustomersController,
    AddressesController,
    VehiclesController,
    FavoritesController,
  ],
  providers: [CustomersService, AddressesService, VehiclesService, FavoritesService],
  exports: [CustomersService],
})
export class CustomersModule {}
