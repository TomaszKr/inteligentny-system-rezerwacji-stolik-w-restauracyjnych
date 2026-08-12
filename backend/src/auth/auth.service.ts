import {
  Injectable,
  ConflictException,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/User.entity';

function emailVerificationEnabled(): boolean {
  return (process.env.EMAIL_VERIFICATION_ENABLED ?? 'true') === 'true';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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
      // Wymóg weryfikacji e-mail (#81) — sprawdzane po poprawnym haśle (bez enumeracji)
      if (emailVerificationEnabled() && !user.emailVerified) {
        this.logger.warn(`Logowanie niezweryfikowanego konta: ${email}`);
        throw new UnauthorizedException('Adres e-mail nie został zweryfikowany');
      }
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
    const verificationToken = randomBytes(32).toString('hex');
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'user',
      emailVerified: false,
      verificationToken,
    });
    this.logger.log(`Nowe konto zarejestrowane: ${email}`);

    // Wyślij e-mail weryfikacyjny (fire-and-forget) + zaloguj link (dev/demo bez SMTP)
    this.mailService
      .sendVerificationEmail(email, `${firstName} ${lastName}`, verificationToken)
      .catch((err) => this.logger.error('Nie udało się wysłać e-maila weryfikacyjnego', err));
    this.logger.log(`Link weryfikacyjny (${email}): /api/auth/verify-email?token=${verificationToken}`);

    // Nie zwracaj hasła ani (domyślnie) tokenu
    const { password: _pw, verificationToken: _vt, ...result } = user;
    // Demo bez skrzynki: opcjonalnie zwróć token, by umożliwić weryfikację
    if ((process.env.EMAIL_VERIFICATION_EXPOSE_TOKEN ?? 'true') === 'true') {
      return { ...result, verificationToken };
    }
    return result;
  }

  /** Weryfikacja adresu e-mail po tokenie (#81). */
  async verifyEmail(token: string): Promise<{ verified: true }> {
    if (!token) {
      throw new BadRequestException('Brak tokenu weryfikacyjnego');
    }
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Nieprawidłowy lub zużyty token weryfikacyjny');
    }
    await this.usersService.markEmailVerified(user.id);
    this.logger.log(`Zweryfikowano e-mail: ${user.email}`);
    return { verified: true };
  }
}
