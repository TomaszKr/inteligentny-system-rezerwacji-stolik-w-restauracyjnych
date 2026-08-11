import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TablesAvailabilityService } from '../services/tables-availability.service';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';
import { TableAvailabilityDto } from '../dto/table-availability.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('tables')
@ApiBearerAuth('access-token')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesAvailabilityService: TablesAvailabilityService) {}

  @Get('availability')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista dostępnych stolików dla podanych kryteriów' })
  @ApiResponse({ status: 200, type: TableAvailabilityDto, isArray: true, description: 'Dostępne stoliki' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe parametry query' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  async checkAvailability(
    @Query() dto: CheckAvailabilityDto
  ): Promise<TableAvailabilityDto[]> {
    return this.tablesAvailabilityService.checkAvailability(dto);
  }
}
