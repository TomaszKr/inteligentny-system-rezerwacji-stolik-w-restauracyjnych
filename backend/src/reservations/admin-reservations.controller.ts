import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from '../database/entities/Reservation.entity';

@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  async findAll(): Promise<Reservation[]> {
    return this.reservationService.findAll();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: string,
  ): Promise<Reservation> {
    return this.reservationService.update(id, { status } as any);
  }
}
