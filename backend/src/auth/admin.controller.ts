import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('dashboard')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Panel admina (wymaga roli admin)' })
  @ApiResponse({
    status: 200,
    description: 'Dostęp do panelu admina przyznany',
    schema: { example: { message: 'Admin dashboard access granted' } },
  })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  @ApiResponse({ status: 403, description: 'Użytkownik nie jest administratorem' })
  getAdminDashboard() {
    return { message: 'Admin dashboard access granted' };
  }
}
