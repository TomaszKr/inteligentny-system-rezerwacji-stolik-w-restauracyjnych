import { IsInt, IsNotEmpty, IsDateString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsInt()
  @IsNotEmpty()
  restaurantId: number;

  @IsDateString()
  @IsNotEmpty()
  reservationTime: Date;

  @IsInt()
  @IsNotEmpty()
  guests: number;
}