import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';

@ApiTags('reservations')
@ApiBearerAuth('access-token')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Utwórz rezerwację stolika' })
  @ApiResponse({ status: 201, description: 'Rezerwacja utworzona pomyślnie' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowa lub przeszła data / guests < 1' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 404, description: 'Stolik nie istnieje' })
  @ApiResponse({ status: 409, description: 'Kolizja — stolik już zarezerwowany w tym czasie' })
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
