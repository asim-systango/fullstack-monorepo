import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorDocumentsColumn1785932184729 implements MigrationInterface {
  name = 'AddDoctorDocumentsColumn1785932184729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "documents" jsonb DEFAULT '[]'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "documents"`,
    );
  }
}
