import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestCountToRsvps1788955000000 implements MigrationInterface {
  name = 'AddGuestCountToRsvps1788955000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "guestCount" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rsvps" DROP COLUMN IF EXISTS "guestCount"`,
    );
  }
}
