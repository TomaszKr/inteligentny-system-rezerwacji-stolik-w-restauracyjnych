import { IsDate, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsFutureDate } from '../common/validators/is-future-date.validator';

export class CreateReservationDto {
  @ApiProperty({
    example: '2026-12-24T19:00:00.000Z',
    format: 'date-time',
    type: String,
    description: 'Data i godzina rezerwacji (przyszłość, ISO 8601)',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @IsFutureDate()
  reservationTime: Date;

  @ApiProperty({ example: 4, minimum: 1, maximum: 50 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  guests: number;

  @ApiProperty({ example: 12, description: 'ID stolika' })
  @IsNumber()
  @IsNotEmpty()
  tableId: number;
}
