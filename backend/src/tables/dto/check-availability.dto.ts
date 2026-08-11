import { IsInt, IsNotEmpty, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

export class CheckAvailabilityDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  restaurantId: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @IsFutureDate()
  reservationTime: Date;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  guests: number;
}
