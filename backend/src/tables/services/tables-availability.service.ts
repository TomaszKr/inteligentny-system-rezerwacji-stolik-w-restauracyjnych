import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Table } from '../../database/entities/Table.entity';
import { Reservation } from '../../database/entities/Reservation.entity';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';
import { TableAvailabilityDto } from '../dto/table-availability.dto';

@Injectable()
export class TablesAvailabilityService {
  private readonly logger = new Logger(TablesAvailabilityService.name);

  constructor(
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
    
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    
    private dataSource: DataSource,
  ) {}

  async checkAvailability(dto: CheckAvailabilityDto): Promise<TableAvailabilityDto[]> {
    const { restaurantId, reservationTime, guests } = dto;
    
    // Wykorzystanie transakcji z poziomem izolacji SERIALIZABLE
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Optymalne zapytanie z JOIN-em do znalezienia dostępnych stolików
      const availableTables = await queryRunner.manager
        .createQueryBuilder(Table, 'table')
        .leftJoinAndSelect('table.restaurant', 'restaurant')
        .leftJoin(Reservation, 'reservation', 
          'reservation.tableId = table.id AND reservation.reservationTime = :reservationTime',
          { reservationTime }
        )
        .where('table.restaurantId = :restaurantId', { restaurantId })
        .andWhere('table.capacity >= :guests', { guests })
        .andWhere('reservation.id IS NULL') // tylko stoliki bez rezerwacji
        .select([
          'table.id',
          'table.tableNumber', 
          'table.capacity'
        ])
        .getMany();

      await queryRunner.commitTransaction();
      
      return availableTables.map(table => ({
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity
      }));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error checking table availability', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}