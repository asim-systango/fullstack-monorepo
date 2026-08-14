import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserOtpColumns1771000000000 implements MigrationInterface {
  name = 'AddUserOtpColumns1771000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "otp_hash" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "otp_expires_at" TIMESTAMPTZ`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "otp_attempts" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "otp_sent_at" TIMESTAMPTZ`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "otp_purpose" character varying(32)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_purpose"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_sent_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_attempts"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_expires_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp_hash"`);
  }
}
