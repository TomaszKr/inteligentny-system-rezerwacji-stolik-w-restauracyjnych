import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
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
    schema: { example: { id: 1, email: 'jan@example.com', firstName: 'Jan', role: 'user' } },
  })
  @ApiResponse({ status: 400, description: 'Błąd walidacji danych wejściowych' })
  @ApiResponse({ status: 500, description: 'Znany brak: duplikat email nie jest obsłużony' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.firstName);
  }
}
