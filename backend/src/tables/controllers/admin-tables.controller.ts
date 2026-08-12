import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { TablesManagementService } from '../services/tables-management.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/tables')
export class AdminTablesController {
  constructor(private readonly tablesManagementService: TablesManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nowy stolik (wymaga roli admin)' })
  @ApiResponse({ status: 201, description: 'Stolik utworzony' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane wejściowe' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  @ApiResponse({ status: 404, description: 'Restauracja nie istnieje' })
  create(@Body() dto: CreateTableDto) {
    return this.tablesManagementService.createTable(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz listę stolików (wymaga roli admin)' })
  @ApiQuery({ name: 'restaurantId', required: false, type: Number, description: 'Filtruj po ID restauracji' })
  @ApiResponse({ status: 200, description: 'Lista stolików' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  findAll(@Query('restaurantId') restaurantId?: string) {
    return this.tablesManagementService.findTables(restaurantId ? Number(restaurantId) : undefined);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj stolik (wymaga roli admin)' })
  @ApiResponse({ status: 200, description: 'Stolik zaktualizowany' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane wejściowe' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  @ApiResponse({ status: 404, description: 'Stolik nie istnieje' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
    return this.tablesManagementService.updateTable(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń stolik (wymaga roli admin)' })
  @ApiResponse({ status: 200, description: 'Stolik usunięty' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  @ApiResponse({ status: 404, description: 'Stolik nie istnieje' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tablesManagementService.deleteTable(id);
  }
}
