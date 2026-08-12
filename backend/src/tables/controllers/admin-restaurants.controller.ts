import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { TablesManagementService } from '../services/tables-management.service';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/restaurants')
export class AdminRestaurantsController {
  constructor(private readonly tablesManagementService: TablesManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nową restaurację (wymaga roli admin)' })
  @ApiResponse({ status: 201, description: 'Restauracja utworzona' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane wejściowe' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  create(@Body() dto: CreateRestaurantDto) {
    return this.tablesManagementService.createRestaurant(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz listę restauracji (wymaga roli admin)' })
  @ApiResponse({ status: 200, description: 'Lista restauracji' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  findAll() {
    return this.tablesManagementService.findRestaurants();
  }
}
