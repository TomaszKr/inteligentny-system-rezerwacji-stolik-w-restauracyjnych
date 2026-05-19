import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('dashboard')
  getAdminDashboard() {
    return { message: 'Admin dashboard access granted' };
  }
}