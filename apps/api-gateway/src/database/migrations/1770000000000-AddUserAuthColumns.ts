import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAuthColumns1770000000000 implements MigrationInterface {
  name = 'AddUserAuthColumns1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" TYPE citext USING lower("email")::citext`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "email_verified_at" TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE "users" ADD "last_login_at" TIMESTAMPTZ`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" TYPE character varying USING "email"::text`,
    );
  }
}
