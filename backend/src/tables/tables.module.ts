import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from '../database/entities/Table.entity';
import { Reservation } from '../database/entities/Reservation.entity';
import { TablesAvailabilityService } from './services/tables-availability.service';
import { TablesController } from './controllers/tables.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table, Reservation]),
  ],
  controllers: [TablesController],
  providers: [TablesAvailabilityService],
  exports: [TablesAvailabilityService],
})
export class TablesModule {}