import { IsDate, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsDate()
  reservationTime: Date;

  @IsNumber()
  guests: number;

  @IsNumber()
  tableId: number;
}