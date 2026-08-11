import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../enums/reservation-status.enum';

export class UpdateReservationStatusDto {
  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.COMPLETED,
    description: 'Nowy status rezerwacji',
  })
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status: ReservationStatus;
}
