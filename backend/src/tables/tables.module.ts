import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from '../database/entities/Table.entity';
import { Reservation } from '../database/entities/Reservation.entity';
import { Restaurant } from '../database/entities/Restaurant.entity';
import { TablesAvailabilityService } from './services/tables-availability.service';
import { TablesManagementService } from './services/tables-management.service';
import { TablesController } from './controllers/tables.controller';
import { AdminRestaurantsController } from './controllers/admin-restaurants.controller';
import { AdminTablesController } from './controllers/admin-tables.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table, Reservation, Restaurant]),
  ],
  controllers: [TablesController, AdminRestaurantsController, AdminTablesController],
  providers: [TablesAvailabilityService, TablesManagementService],
  exports: [TablesAvailabilityService],
})
export class TablesModule {}
