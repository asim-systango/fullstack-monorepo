import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToUsers1720000000001 implements MigrationInterface {
  name = 'AddAvatarUrlToUsers1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url"`);
  }
}
