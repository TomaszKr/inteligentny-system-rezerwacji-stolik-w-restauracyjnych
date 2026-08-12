import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { UserRole } from './enums/user-role.enum';

/**
 * Tworzy początkowe konto administratora przy starcie (#20), jeśli jeszcze nie istnieje.
 * Dzięki temu admin może się zalogować i nadawać role pracownikom oraz edytować
 * dane systemowe (rejestracja tworzy tylko role 'user').
 * Idempotentne — nie nadpisuje istniejącego konta.
 */
@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    const email = process.env.ADMIN_EMAIL || 'admin@restaurant.local';
    const password = process.env.ADMIN_PASSWORD || 'admin12345';

    try {
      const existing = await this.usersService.findByEmail(email);
      if (existing) {
        this.logger.log(`Admin account already exists (${email}) — skipping seed`);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.usersService.create({
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Systemowy',
        phone: '000000000',
        role: UserRole.ADMIN,
      });

      this.logger.warn(
        `Utworzono konto administratora (${email}). ` +
          'ZMIEŃ domyślne hasło przez ADMIN_PASSWORD w .env dla środowisk produkcyjnych.',
      );
    } catch (err) {
      this.logger.error('Nie udało się zaseedować konta administratora', err as Error);
    }
  }
}
