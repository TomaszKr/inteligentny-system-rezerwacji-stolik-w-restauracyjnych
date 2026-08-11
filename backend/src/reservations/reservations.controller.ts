import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: any,
  ) {
    return this.reservationService.create({
      reservationTime: createReservationDto.reservationTime,
      guests: createReservationDto.guests,
      tableId: createReservationDto.tableId,
      user: { id: req.user.id },
    });
  }
}
