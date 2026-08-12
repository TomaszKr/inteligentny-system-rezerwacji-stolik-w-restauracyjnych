import { IsInt, IsNotEmpty, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

export class CheckAvailabilityDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'ID restauracji' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  restaurantId: number;

  @ApiProperty({ example: '2026-12-24T19:00:00.000Z', format: 'date-time', type: String, description: 'Data i godzina rezerwacji (przyszłość, ISO 8601)' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @IsFutureDate()
  reservationTime: Date;

  @ApiProperty({ example: 2, minimum: 1, maximum: 50, description: 'Liczba gości' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  guests: number;
}
