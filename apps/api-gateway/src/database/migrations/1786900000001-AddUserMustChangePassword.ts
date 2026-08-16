import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserMustChangePassword1786900000001 implements MigrationInterface {
  name = 'AddUserMustChangePassword1786900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "must_change_password" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "must_change_password"`);
  }
}
