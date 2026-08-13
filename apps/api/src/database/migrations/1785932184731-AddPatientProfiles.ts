import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds patient_profiles table.
 *
 * Previously patients were "anonymous" — identified only by patientId UUID
 * in the appointments table pointing to users.id.
 *
 * This migration adds an optional extended profile table for patients,
 * following the exact same pattern as doctor_profiles:
 *
 *   users (role='PATIENT') ──1:1──▶ patient_profiles
 *
 * The table is completely optional — existing functionality is 100% preserved
 * because appointments still reference users.id directly. This table simply
 * provides a dedicated place for patient health metadata.
 */
export class AddPatientProfiles1785932184731 implements MigrationInterface {
  name = 'AddPatientProfiles1785932184731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "patient_profiles" (
        "id"                uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "userId"            uuid         NOT NULL,
        "firstName"         varchar(50),
        "lastName"          varchar(50),
        "date_of_birth"     date,
        "gender"            varchar(10),
        "blood_group"       varchar(5),
        "emergency_contact" varchar(20),
        "allergies"         text,
        "medical_history"   text,
        "profile_image"     varchar(255),
        CONSTRAINT "UQ_patient_profiles_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_patient_profiles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_patient_profiles_userId"
      ON "patient_profiles" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_profiles_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_profiles"`);
  }
}
