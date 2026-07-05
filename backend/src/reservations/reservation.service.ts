import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { User } from '../database/entities/User.entity';
import { ReservationGateway } from './reservation.gateway';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

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

  async create(reservationData: Partial<Reservation>): Promise<Reservation> {
    // Wykorzystanie transakcji z poziomem izolacji SERIALIZABLE
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Sprawdzenie czy stolik jest dostępny w danym czasie
      const existingReservation = await queryRunner.manager
        .createQueryBuilder(Reservation, 'reservation')
        .where('reservation.table.id = :tableId', { tableId: reservationData.table?.id })
        .andWhere('reservation.reservationTime = :reservationTime', { 
          reservationTime: reservationData.reservationTime 
        })
        .getOne();

      if (existingReservation) {
        throw new Error('Table is already reserved for this time slot');
      }

      const reservation = this.reservationRepository.create(reservationData);
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

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find();
  }

  async findOne(id: number): Promise<Reservation | undefined> {
    return this.reservationRepository.findOneBy({ id });
  }

  async update(id: number, updateData: Partial<Reservation>): Promise<Reservation> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    Object.assign(reservation, updateData);
    return this.reservationRepository.save(reservation);
  }
}
