import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TablesAvailabilityService } from '../services/tables-availability.service';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';
import { TableAvailabilityDto } from '../dto/table-availability.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesAvailabilityService: TablesAvailabilityService) {}

  @Get('availability')
  @UseGuards(JwtAuthGuard)
  async checkAvailability(
    @Query() dto: CheckAvailabilityDto
  ): Promise<TableAvailabilityDto[]> {
    return this.tablesAvailabilityService.checkAvailability(dto);
  }
}
