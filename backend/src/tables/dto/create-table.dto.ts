import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'Numer stolika' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  tableNumber: number;

  @ApiProperty({ example: 4, minimum: 1, description: 'Liczba miejsc przy stoliku' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  capacity: number;

  @ApiProperty({ example: 1, minimum: 1, description: 'ID restauracji, do której należy stolik' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  restaurantId: number;
}
