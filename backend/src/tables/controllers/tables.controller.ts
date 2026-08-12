import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TablesAvailabilityService } from '../services/tables-availability.service';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';
import { TableAvailabilityDto } from '../dto/table-availability.dto';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesAvailabilityService: TablesAvailabilityService) {}

  // Publiczny — klient przegląda dostępność przed zalogowaniem/rezerwacją
  @Get('availability')
  @ApiOperation({ summary: 'Lista dostępnych stolików dla podanych kryteriów (publiczny)' })
  @ApiResponse({ status: 200, type: TableAvailabilityDto, isArray: true, description: 'Dostępne stoliki' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe parametry query' })
  async checkAvailability(
    @Query() dto: CheckAvailabilityDto
  ): Promise<TableAvailabilityDto[]> {
    return this.tablesAvailabilityService.checkAvailability(dto);
  }
}
