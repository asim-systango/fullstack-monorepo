import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHospitalChargesAndAppointmentFees1785932184728 implements MigrationInterface {
  name = 'AddHospitalChargesAndAppointmentFees1785932184728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "hospitalCharge" numeric(10,2) NOT NULL DEFAULT '10'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "consultationFee" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "hospitalCharge" numeric(10,2) NOT NULL DEFAULT '10'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "totalAmount" numeric(10,2) NOT NULL DEFAULT '10'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN IF EXISTS "totalAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN IF EXISTS "hospitalCharge"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN IF EXISTS "consultationFee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "hospitalCharge"`,
    );
  }
}
