import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../enums/table-status.enum';

export class UpdateTableStatusDto {
  @ApiProperty({
    enum: TableStatus,
    example: TableStatus.OCCUPIED,
    description: 'Status stolika: wolny / zajęty',
  })
  @IsEnum(TableStatus)
  @IsNotEmpty()
  status: TableStatus;
}
