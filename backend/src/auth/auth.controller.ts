import { Controller, Post, Get, Body, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
// Endpointy publiczne (bez JWT) — ostrzejszy limit z env (anti brute-force / spam)
@Throttle({
  default: {
    ttl: parseInt(process.env.RATE_LIMIT_PUBLIC_TTL, 10) || 60000,
    limit: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX, 10) || 10,
  },
})
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Logowanie — zwraca token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Zalogowano pomyślnie — zwraca token JWT',
    schema: { example: { access_token: 'eyJhbGci...' } },
  })
  @ApiResponse({ status: 401, description: 'Nieprawidłowy email lub hasło' })
  @ApiResponse({ status: 400, description: 'Brak wymaganego pola (email/password)' })
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Rejestracja nowego użytkownika' })
  @ApiResponse({
    status: 201,
    description: 'Utworzono użytkownika (bez pola password)',
    schema: {
      example: {
        id: 1,
        email: 'jan@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '+48123456789',
        role: 'user',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Błąd walidacji danych wejściowych' })
  @ApiResponse({ status: 409, description: 'Użytkownik z tym adresem email już istnieje' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.phone,
    );
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Weryfikacja adresu e-mail (token z linku)' })
  @ApiQuery({ name: 'token', required: true, description: 'Token weryfikacyjny' })
  @ApiResponse({ status: 200, description: 'E-mail zweryfikowany' })
  @ApiResponse({ status: 400, description: 'Brak lub nieprawidłowy token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Wyloguj — unieważnia wszystkie tokeny użytkownika' })
  @ApiResponse({ status: 200, description: 'Sesje unieważnione' })
  @ApiResponse({ status: 401, description: 'Brak lub nieważny token JWT' })
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}
