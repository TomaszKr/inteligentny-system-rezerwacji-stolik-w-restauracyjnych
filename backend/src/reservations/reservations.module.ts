import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Reservation } from '../database/entities/Reservation.entity';
import { User } from '../database/entities/User.entity';
import { UsersModule } from '../users/users.module';
import { ReservationService } from './reservation.service';
import { ReservationGateway } from './reservation.gateway';
import { ReservationsController } from './reservations.controller';
import { AdminReservationsController } from './admin-reservations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User]),
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ReservationsController, AdminReservationsController],
  providers: [ReservationService, ReservationGateway],
  exports: [ReservationService],
})
export class ReservationsModule {}
