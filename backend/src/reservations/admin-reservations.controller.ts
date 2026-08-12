import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ReservationService } from './reservation.service';
import { Reservation } from '../database/entities/Reservation.entity';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  @ApiOperation({ summary: 'Lista wszystkich rezerwacji (tylko admin)' })
  @ApiResponse({ status: 200, description: 'Lista rezerwacji' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  async findAll(): Promise<Reservation[]> {
    return this.reservationService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Zmień status rezerwacji (tylko admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID rezerwacji do zaktualizowania' })
  @ApiResponse({ status: 200, description: 'Zaktualizowana rezerwacja' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowy enum statusu lub :id' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  @ApiResponse({ status: 404, description: 'Rezerwacja o podanym id nie istnieje' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
    return this.reservationService.update(id, { status: dto.status });
  }
}
