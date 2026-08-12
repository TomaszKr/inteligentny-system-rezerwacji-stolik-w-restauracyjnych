import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 50, default: 'user' })
  role: string;

  // Wersja tokenu — inkrementacja unieważnia wszystkie wydane JWT (#78, OWASP A07)
  @Column({ type: 'integer', default: 0 })
  tokenVersion: number;

  // Blokada konta po nieudanych logowaniach (#81, OWASP A04/A07)
  @Column({ type: 'integer', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  // Weryfikacja e-mail (#81, OWASP A04)
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  verificationToken: string | null;

  // 2FA / TOTP (#88, OWASP A07)
  @Column({ type: 'varchar', length: 128, nullable: true })
  twoFactorSecret: string | null;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;
}