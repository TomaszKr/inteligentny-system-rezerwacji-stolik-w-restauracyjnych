import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToReservations1610000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add status column if it doesn't exist yet
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reservations ADD COLUMN status varchar(50) DEFAULT 'confirmed';
      EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'status column already exists';
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE reservations DROP COLUMN status;
      EXCEPTION
        WHEN undefined_column THEN RAISE NOTICE 'status column does not exist';
      END $$;
    `);
  }
}
