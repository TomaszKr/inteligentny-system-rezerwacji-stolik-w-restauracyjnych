import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Domyka rozjazd między encjami a bazowymi migracjami (001–005). Kolumny poniżej
 * istniały dotąd wyłącznie dzięki `synchronize:true`; ta migracja pozwala
 * uruchomić aplikację z `DB_SYNCHRONIZE=false` (produkcja) na świeżej bazie (#92).
 *
 * Idempotentna — `ADD COLUMN IF NOT EXISTS` nie rusza istniejących kolumn,
 * więc jest bezpieczna także na bazie zbudowanej wcześniej przez synchronize.
 */
export class AddSecurityAndStatusColumns1610000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // users — rola + kolumny bezpieczeństwa (#20, #78, #81, #88)
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS "role" varchar(50) NOT NULL DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS "tokenVersion" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "failedLoginAttempts" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "lockedUntil" timestamp NULL,
        ADD COLUMN IF NOT EXISTS "emailVerified" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "verificationToken" varchar(128) NULL,
        ADD COLUMN IF NOT EXISTS "twoFactorSecret" varchar(128) NULL,
        ADD COLUMN IF NOT EXISTS "twoFactorEnabled" boolean NOT NULL DEFAULT false
    `);

    // tables — ręczny status stolika (#18)
    await queryRunner.query(`
      ALTER TABLE tables
        ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'wolny'
    `);

    // reservations — flaga wysłanego przypomnienia (cron, #33)
    await queryRunner.query(`
      ALTER TABLE reservations
        ADD COLUMN IF NOT EXISTS "reminderSent" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reservations DROP COLUMN IF EXISTS "reminderSent"
    `);
    await queryRunner.query(`
      ALTER TABLE tables DROP COLUMN IF EXISTS "status"
    `);
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS "twoFactorEnabled",
        DROP COLUMN IF EXISTS "twoFactorSecret",
        DROP COLUMN IF EXISTS "verificationToken",
        DROP COLUMN IF EXISTS "emailVerified",
        DROP COLUMN IF EXISTS "lockedUntil",
        DROP COLUMN IF EXISTS "failedLoginAttempts",
        DROP COLUMN IF EXISTS "tokenVersion",
        DROP COLUMN IF EXISTS "role"
    `);
  }
}
