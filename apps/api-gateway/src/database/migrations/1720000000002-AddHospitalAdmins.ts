import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds hospital_admins table (api-gateway schema).
 *
 * Previously there was no way to distinguish admin users from each other
 * or know which hospital they manage. Admins were just users with role='ADMIN'.
 *
 * This migration adds an optional extended profile table for admin users,
 * following the exact same pattern as doctor_profiles (in apps/api):
 *
 *   users (role='ADMIN') ──1:1──▶ hospital_admins
 *
 * The table is completely optional — existing auth and role-check logic is
 * 100% preserved because JWT guards still use users.role. This table simply
 * provides a dedicated place for hospital/organisation metadata.
 */
export class AddHospitalAdmins1720000000002 implements MigrationInterface {
  name = 'AddHospitalAdmins1720000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hospital_admins" (
        "id"            uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId"        uuid        NOT NULL,
        "hospital_name" varchar(150),
        "department"    varchar(100),
        "job_title"     varchar(100),
        "office_phone"  varchar(20),
        "address"       varchar(255),
        "profile_image" varchar(255),
        CONSTRAINT "UQ_hospital_admins_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_hospital_admins"        PRIMARY KEY ("id"),
        CONSTRAINT "FK_hospital_admins_userId"  FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_hospital_admins_userId"
      ON "hospital_admins" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hospital_admins_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hospital_admins"`);
  }
}
