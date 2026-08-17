import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Drops all tables that have no frontend consumers.
 * These were part of an enterprise multi-hospital schema that was never
 * integrated into the frontend UI. Keeping them creates maintenance burden
 * and misleads developers about what the application actually supports.
 *
 * Tables dropped (in dependency order to satisfy FK constraints):
 *  - doctor_departments (join table — doctor ↔ department)
 *  - doctor_schedules   (recurring schedule config — replaced by slot-based booking)
 *  - staff_profiles     (non-doctor staff — no FE feature)
 *  - departments        (hospital departments — no FE feature)
 *  - prescription_items (normalised medicines — app uses prescriptions.medicines jsonb)
 *  - encounters         (clinical encounter records — no FE feature)
 *  - admissions         (IPD admissions — no FE feature)
 *  - beds               (IPD bed management — no FE feature)
 *  - wards              (IPD ward management — no FE feature)
 *  - invoice_items      (billing line items — no FE feature)
 *  - payments           (payment records — Stripe handled via PaymentService; no DB row)
 *  - invoices           (billing invoices — no FE feature)
 *  - audit_logs         (DB audit table — app uses interceptor console logging)
 *  - user_roles         (enterprise role mapping — app uses JWT role claim)
 *  - patient_profiles   (extended patient record — no FE feature)
 *  - hospital_branches  (multi-branch — no FE feature)
 *  - hospitals          (enterprise hospitals — no FE feature)
 *
 * Also removes unused columns that were added in migration 1785932184727:
 *  - doctor_profiles.hospital_id
 *  - slots.hospital_id
 *  - appointments.hospital_id
 *  - medical_notes.encounter_id, subjective, objective, assessment, plan
 *  - prescriptions.encounter_id, diagnosis, valid_until
 */
export class DropUnusedTables1785932184730 implements MigrationInterface {
  name = 'DropUnusedTables1785932184730';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Drop join / leaf tables first (FK dependents) ──────────────────────────

    await queryRunner.query(`DROP TABLE IF EXISTS "doctor_departments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctor_schedules" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_profiles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prescription_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "encounters" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "beds" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wards" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_profiles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hospital_branches" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hospitals" CASCADE;`);

    // ── Remove unused columns from retained tables ─────────────────────────────

    // doctor_profiles — hospital_id was part of multi-tenant schema (not used)
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "hospital_id";`,
    );

    // slots — hospital_id was part of multi-tenant schema (not used)
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "hospital_id";`);

    // appointments — hospital_id was part of multi-tenant schema (not used)
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN IF EXISTS "hospital_id";`,
    );

    // medical_notes — SOAP note fields were for EHR encounter workflow (not used)
    await queryRunner.query(
      `ALTER TABLE "medical_notes" DROP COLUMN IF EXISTS "encounter_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" DROP COLUMN IF EXISTS "subjective";`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" DROP COLUMN IF EXISTS "objective";`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" DROP COLUMN IF EXISTS "assessment";`,
    );
    await queryRunner.query(`ALTER TABLE "medical_notes" DROP COLUMN IF EXISTS "plan";`);

    // prescriptions — encounter_id / diagnosis / valid_until were for EHR (not used)
    await queryRunner.query(
      `ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "encounter_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "diagnosis";`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "valid_until";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore dropped columns on retained tables
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "valid_until" date;`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "diagnosis" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "encounter_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "plan" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "assessment" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "objective" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "subjective" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "encounter_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );

    // NOTE: Restoring dropped tables requires full schema recreation.
    // Run migration 1785932184727 up() to restore them if needed.
  }
}
