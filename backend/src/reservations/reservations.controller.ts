import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { Request } from 'express';
import { User } from '../database/entities/User.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ) {
    // Inject the authenticated user's ID into the reservation data
    const reservationData = {
      ...createReservationDto,
      userId: req.user.id, // Get user ID from JWT token
    };

    return this.reservationService.create(reservationData);
  }
}