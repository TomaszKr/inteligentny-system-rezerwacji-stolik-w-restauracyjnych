import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { Reservation } from '../database/entities/Reservation.entity';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@ApiTags('admin')
@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  @ApiOperation({ summary: 'Lista wszystkich rezerwacji (UWAGA: obecnie bez guarda — publiczny)' })
  @ApiResponse({ status: 200, description: 'Lista rezerwacji' })
  async findAll(): Promise<Reservation[]> {
    return this.reservationService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Zmień status rezerwacji (UWAGA: obecnie bez guarda — publiczny)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID rezerwacji do zaktualizowania' })
  @ApiResponse({ status: 200, description: 'Zaktualizowana rezerwacja' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowy enum statusu lub :id' })
  @ApiResponse({ status: 500, description: 'Znany brak: rezerwacja o podanym id nie istnieje → generic Error' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
    return this.reservationService.update(id, { status: dto.status });
  }
}
