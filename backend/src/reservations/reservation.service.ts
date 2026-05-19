import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { User } from '../database/entities/User.entity';
import { ReservationGateway } from './reservation.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private readonly reservationGateway: ReservationGateway,
    private readonly usersService: UsersService,
  ) {}

  async create(reservationData: Partial<Reservation>): Promise<Reservation> {
    const reservation = this.reservationRepository.create(reservationData);
    const savedReservation = await this.reservationRepository.save(reservation);
    
    // Emit notification to all connected managers
    this.reservationGateway.handleNewReservation(savedReservation);
    
    return savedReservation;
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find();
  }

  async findOne(id: number): Promise<Reservation | undefined> {
    return this.reservationRepository.findOneBy({ id });
  }
}
