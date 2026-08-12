import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/User.entity';
import { UserRole } from './enums/user-role.enum';

export type SafeUser = Omit<
  User,
  'password' | 'twoFactorSecret' | 'verificationToken'
>;

/** Usuwa wrażliwe pola z encji User przed zwróceniem w API. */
export function toSafeUser(user: User): SafeUser {
  const {
    password: _pw,
    twoFactorSecret: _2fa,
    verificationToken: _vt,
    ...safe
  } = user;
  return safe;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  /** Inkrementuje tokenVersion — unieważnia wszystkie wydane tokeny usera (#78). */
  async incrementTokenVersion(id: number): Promise<void> {
    const result = await this.usersRepository.increment({ id }, 'tokenVersion', 1);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Rejestruje nieudaną próbę logowania (#81). Po przekroczeniu limitu blokuje
   * konto na skonfigurowany czas.
   */
  async recordFailedLogin(user: User): Promise<void> {
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    const max = parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5;
    const lockMinutes = parseInt(process.env.LOGIN_LOCK_MINUTES, 10) || 15;
    const lockedUntil =
      attempts >= max ? new Date(Date.now() + lockMinutes * 60000) : null;
    await this.usersRepository.update(user.id, {
      failedLoginAttempts: attempts,
      lockedUntil,
    });
  }

  /** Zeruje licznik nieudanych logowań i odblokowuje konto (#81). */
  async resetFailedLogins(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  /** Znajdź użytkownika po tokenie weryfikacyjnym (#81). */
  async findByVerificationToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ verificationToken: token });
  }

  /** Oznacz e-mail jako zweryfikowany i wyczyść token (#81). */
  async markEmailVerified(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      emailVerified: true,
      verificationToken: null,
    });
  }

  /** Lista użytkowników bez wrażliwych pól (dla panelu admina). */
  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find();
    return users.map(toSafeUser);
  }

  /** Zmiana roli użytkownika (admin nadaje role pracownikom). */
  async updateRole(
    id: number,
    role: UserRole,
    actingUserId?: number,
  ): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const demotingFromAdmin =
      user.role === UserRole.ADMIN && role !== UserRole.ADMIN;

    // Admin nie może zdegradować własnego konta (#65) — ochrona przed lockoutem
    if (actingUserId != null && id === actingUserId && demotingFromAdmin) {
      throw new ForbiddenException('Nie możesz odebrać własnego uprawnienia administratora');
    }

    // Nie można pozostawić systemu bez żadnego administratora (#65)
    if (demotingFromAdmin) {
      const adminCount = await this.usersRepository.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new ConflictException('W systemie musi pozostać co najmniej jeden administrator');
      }
    }

    user.role = role;
    const saved = await this.usersRepository.save(user);
    // Audyt zdarzeń bezpieczeństwa (OWASP A09)
    this.logger.warn(
      `Zmiana roli: użytkownik #${id} → '${role}' (przez #${actingUserId ?? 'system'})`,
    );
    return toSafeUser(saved);
  }

  /** Zapis sekretu 2FA (jeszcze nieaktywnego) (#88). */
  async setTwoFactorSecret(id: number, secret: string): Promise<void> {
    await this.usersRepository.update(id, { twoFactorSecret: secret });
  }

  /** Włącz/wyłącz 2FA; przy wyłączeniu czyści sekret (#88). */
  async setTwoFactorEnabled(id: number, enabled: boolean): Promise<void> {
    await this.usersRepository.update(id, {
      twoFactorEnabled: enabled,
      ...(enabled ? {} : { twoFactorSecret: null }),
    });
  }
}