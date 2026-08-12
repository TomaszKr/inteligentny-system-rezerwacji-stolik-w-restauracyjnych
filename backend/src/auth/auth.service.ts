import { Injectable, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/User.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    // Blokada konta po nieudanych próbach (#81) — odrzuć nawet przy poprawnym haśle
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      this.logger.warn(`Logowanie zablokowanego konta: ${email}`);
      throw new UnauthorizedException(
        'Konto tymczasowo zablokowane po zbyt wielu nieudanych próbach logowania',
      );
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.failedLoginAttempts > 0) {
        await this.usersService.resetFailedLogins(user.id);
      }
      // Audyt zdarzeń bezpieczeństwa (OWASP A09) — bez sekretów
      this.logger.log(`Udane logowanie: ${email}`);
      const { password: _pw, ...result } = user;
      return result;
    }

    if (user) {
      await this.usersService.recordFailedLogin(user);
    }
    this.logger.warn(`Nieudane logowanie: ${email}`);
    return null;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tv: user.tokenVersion ?? 0,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Wylogowanie/unieważnienie sesji (#78) — inkrementuje tokenVersion, przez co
   * wszystkie dotychczas wydane tokeny użytkownika stają się nieważne.
   */
  async logout(userId: number): Promise<{ success: true }> {
    await this.usersService.incrementTokenVersion(userId);
    this.logger.log(`Wylogowanie/unieważnienie sesji: użytkownik #${userId}`);
    return { success: true };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) {
    // Duplikat email → 409 zamiast 500 z DB (#68)
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Użytkownik z tym adresem email już istnieje');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'user',
    });
    this.logger.log(`Nowe konto zarejestrowane: ${email}`);
    // Nie zwracaj hasła (hash) w odpowiedzi API
    const { password: _pw, ...result } = user;
    return result;
  }
}
