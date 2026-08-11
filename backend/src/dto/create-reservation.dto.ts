import { IsDate, IsNumber, IsNotEmpty, Min } from 'class-validator';
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

  @ApiProperty({ example: 4, minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  guests: number;

  @ApiProperty({ example: 12, description: 'ID stolika' })
  @IsNumber()
  @IsNotEmpty()
  tableId: number;
}
