import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../../database/entities/Restaurant.entity';
import { Table } from '../../database/entities/Table.entity';
import { Reservation } from '../../database/entities/Reservation.entity';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';

@Injectable()
export class TablesManagementService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async createRestaurant(dto: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurantRepository.save(this.restaurantRepository.create(dto));
  }

  async findRestaurants(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }

  async createTable(dto: CreateTableDto): Promise<Table> {
    const restaurant = await this.restaurantRepository.findOneBy({ id: dto.restaurantId });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const table = this.tableRepository.create({
      tableNumber: dto.tableNumber,
      capacity: dto.capacity,
      restaurant: { id: dto.restaurantId },
    });

    return this.tableRepository.save(table);
  }

  async findTables(restaurantId?: number): Promise<Table[]> {
    if (restaurantId) {
      return this.tableRepository.find({
        where: { restaurant: { id: restaurantId } },
        relations: ['restaurant'],
      });
    }

    return this.tableRepository.find({ relations: ['restaurant'] });
  }

  async updateTable(id: number, dto: UpdateTableDto): Promise<Table> {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    Object.assign(table, dto);
    return this.tableRepository.save(table);
  }

  async deleteTable(id: number): Promise<{ deleted: true }> {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Nie pozwól usunąć stolika z istniejącymi rezerwacjami (FK) — czytelny 409 zamiast 500
    const relatedReservations = await this.reservationRepository.count({
      where: { table: { id } },
    });
    if (relatedReservations > 0) {
      throw new ConflictException(
        'Cannot delete a table that has reservations',
      );
    }

    await this.tableRepository.delete(id);
    return { deleted: true };
  }
}
