import { ApiProperty } from '@nestjs/swagger';

export class TableAvailabilityDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 5 })
  tableNumber: number;

  @ApiProperty({ example: 4 })
  capacity: number;
}
