import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { Table } from '../database/entities/Table.entity';
import { ReservationStatus } from './enums/reservation-status.enum';
import { ReservationGateway } from './reservation.gateway';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

export interface CreateReservationInput {
  reservationTime: Date;
  guests: number;
  tableId: number;
  user: { id: number };
}

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private readonly reservationGateway: ReservationGateway,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private dataSource: DataSource,
  ) {}

  async create(input: CreateReservationInput): Promise<Reservation> {
    // Walidacja daty - nie można rezerwować w przeszłości
    if (input.reservationTime && input.reservationTime < new Date()) {
      throw new BadRequestException('Reservation time cannot be in the past');
    }

    // Wykorzystanie transakcji z poziomem izolacji SERIALIZABLE
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Sprawdzenie czy stolik istnieje
      const table = await queryRunner.manager.findOne(Table, {
        where: { id: input.tableId },
      });
      if (!table) {
        throw new NotFoundException('Table not found');
      }

      // Sprawdzenie czy stolik jest dostępny w danym czasie
      const existingReservation = await queryRunner.manager
        .createQueryBuilder(Reservation, 'reservation')
        .where('reservation.tableId = :tableId', { tableId: input.tableId })
        .andWhere('reservation.reservationTime = :reservationTime', {
          reservationTime: input.reservationTime,
        })
        .getOne();

      if (existingReservation) {
        throw new ConflictException('Table is already reserved for this time slot');
      }

      const reservation = this.reservationRepository.create({
        reservationTime: input.reservationTime,
        guests: input.guests,
        user: input.user,
        table,
      });
      const savedReservation = await queryRunner.manager.save(reservation);
      
      // Emit notification to all connected managers
      this.reservationGateway.handleNewReservation(savedReservation);

      await queryRunner.commitTransaction();

      // Load full reservation with relations after commit
      const fullReservation = await this.reservationRepository.findOne({
        where: { id: savedReservation.id },
        relations: ['user', 'table', 'table.restaurant'],
      });

      // Fire-and-forget: send confirmation email after transaction commit
      if (fullReservation) {
        this.mailService
          .sendReservationConfirmation(fullReservation.id)
          .catch((err) =>
            this.logger.error('Failed to send confirmation email', err),
          );
      }

      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating reservation', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lista rezerwacji dla panelu/kalendarza (#17). Opcjonalny filtr na jeden dzień
   * (date = 'YYYY-MM-DD'). Ładuje relacje user/table; usuwa hasło z usera.
   */
  async findAll(date?: string): Promise<Reservation[]> {
    const options: any = {
      relations: ['user', 'table'],
      order: { reservationTime: 'ASC' },
    };
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new BadRequestException('date must be in YYYY-MM-DD format');
      }
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date');
      }
      options.where = { reservationTime: Between(start, end) };
    }
    const reservations = await this.reservationRepository.find(options);
    // Nie wystawiaj hasła zagnieżdżonego usera
    reservations.forEach((r) => {
      if (r.user) {
        delete (r.user as any).password;
      }
    });
    return reservations;
  }

  async findOne(id: number): Promise<Reservation | undefined> {
    return this.reservationRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Reservation>): Promise<Reservation> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    Object.assign(reservation, updateData);
    return this.reservationRepository.save(reservation);
  }

  /**
   * Odwołanie rezerwacji przez klienta (#15) — soft cancel (status "Anulowana").
   * Tylko właściciel rezerwacji może ją odwołać.
   */
  async cancel(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    if (!reservation.user || reservation.user.id !== userId) {
      throw new ForbiddenException('You can only cancel your own reservation');
    }
    reservation.status = ReservationStatus.CANCELLED;
    return this.reservationRepository.save(reservation);
  }
}
