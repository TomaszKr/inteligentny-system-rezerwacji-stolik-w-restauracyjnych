import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista użytkowników (tylko admin)' })
  @ApiResponse({ status: 200, description: 'Lista użytkowników (bez haseł)' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Nadaj/zmień rolę użytkownika (tylko admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID użytkownika' })
  @ApiResponse({ status: 200, description: 'Zaktualizowany użytkownik (bez hasła)' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowa rola lub :id' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  @ApiResponse({ status: 404, description: 'Użytkownik nie istnieje' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, dto.role);
  }
}
