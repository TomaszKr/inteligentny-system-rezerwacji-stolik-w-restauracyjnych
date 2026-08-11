import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from '../database/entities/Reservation.entity';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  async findAll(): Promise<Reservation[]> {
    return this.reservationService.findAll();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
    return this.reservationService.update(id, { status: dto.status });
  }
}
