import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../database/entities/Reservation.entity';
import { User } from '../database/entities/User.entity';
import { UsersModule } from '../users/users.module';
import { ReservationService } from './reservation.service';
import { ReservationGateway } from './reservation.gateway';
import { ReservationsController } from './reservations.controller';
import { AdminReservationsController } from './admin-reservations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User]), UsersModule],
  controllers: [ReservationsController, AdminReservationsController],
  providers: [ReservationService, ReservationGateway],
  exports: [ReservationService],
})
export class ReservationsModule {}
