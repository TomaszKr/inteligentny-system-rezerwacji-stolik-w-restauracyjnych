import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTableDto {
  @ApiProperty({ example: 2, minimum: 1, required: false, description: 'Numer stolika' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  tableNumber?: number;

  @ApiProperty({ example: 6, minimum: 1, required: false, description: 'Liczba miejsc przy stoliku' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity?: number;
}
