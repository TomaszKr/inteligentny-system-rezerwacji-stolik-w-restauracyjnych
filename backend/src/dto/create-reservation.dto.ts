import { IsDate, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsFutureDate } from '../common/validators/is-future-date.validator';

export class CreateReservationDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @IsFutureDate()
  reservationTime: Date;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  guests: number;

  @IsNumber()
  @IsNotEmpty()
  tableId: number;
}
