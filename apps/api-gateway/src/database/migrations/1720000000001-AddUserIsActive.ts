import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIsActive1720000000001 implements MigrationInterface {
  name = 'AddUserIsActive1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "is_active" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
  }
}
