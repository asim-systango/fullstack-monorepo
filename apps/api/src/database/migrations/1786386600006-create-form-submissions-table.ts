import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFormSubmissionsTable1786386600006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(`
      CREATE TYPE "form_type_enum" AS ENUM (
        'ORGANIZATION_ONBOARDING_REQUEST',
        'CONTACT_US',
        'DEMO_REQUEST'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "form_submission_status_enum" AS ENUM (
        'PENDING',
        'IN_REVIEW',
        'APPROVED',
        'REJECTED'
      );
    `);

    // 2. Create Table
    await queryRunner.query(`
      CREATE TABLE "form_submissions" (
        "id" CHAR(26) PRIMARY KEY,
        "formType" "form_type_enum" NOT NULL DEFAULT 'ORGANIZATION_ONBOARDING_REQUEST',
        "status" "form_submission_status_enum" NOT NULL DEFAULT 'PENDING',
        "contactName" VARCHAR(150) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(30),
        "companyName" VARCHAR(150),
        "companySize" VARCHAR(50),
        "industry" VARCHAR(100),
        "website" VARCHAR(255),
        "message" TEXT,
        "metadata" JSONB,
        "reviewedBy" CHAR(26),
        "reviewNotes" TEXT,
        "reviewedAt" BIGINT,
        "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
        "updatedAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
      );
    `);

    // 3. Create Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_form_submissions_formType" ON "form_submissions" ("formType");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_form_submissions_status" ON "form_submissions" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_form_submissions_email" ON "form_submissions" ("email");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_form_submissions_companyName" ON "form_submissions" ("companyName");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_form_submissions_reviewedBy" ON "form_submissions" ("reviewedBy");`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_form_submissions_createdAt" ON "form_submissions" ("createdAt");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "form_submissions";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "form_submission_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "form_type_enum";`);
  }
}
