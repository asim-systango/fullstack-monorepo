import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnterpriseMultiHospitalSchema1785932184727 implements MigrationInterface {
  name = 'EnterpriseMultiHospitalSchema1785932184727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. hospitals
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hospitals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" varchar(20) NOT NULL UNIQUE,
        "name" varchar(200) NOT NULL,
        "license_number" varchar(100) NOT NULL UNIQUE,
        "contact_email" varchar(150) NOT NULL,
        "contact_phone" varchar(30) NOT NULL,
        "address" jsonb NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "settings" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_hospitals_id" PRIMARY KEY ("id")
      );
    `);

    // 2. hospital_branches
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hospital_branches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid NOT NULL,
        "branch_code" varchar(20) NOT NULL,
        "name" varchar(200) NOT NULL,
        "address" jsonb NOT NULL,
        "contact_phone" varchar(30) NOT NULL,
        "is_main" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_hospital_branches_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_branches_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
      );
    `);

    // 3. user_roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "hospital_id" uuid,
        "role" varchar(30) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_roles_id" PRIMARY KEY ("id")
      );
    `);

    // 4. patient_profiles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE,
        "hospital_id" uuid NOT NULL,
        "mrn" varchar(50) NOT NULL UNIQUE,
        "date_of_birth" date NOT NULL,
        "gender" varchar(20) NOT NULL,
        "blood_group" varchar(10),
        "emergency_contact" jsonb NOT NULL,
        "medical_history" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_patient_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patient_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
      );
    `);

    // 5. departments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid NOT NULL,
        "code" varchar(20) NOT NULL,
        "name" varchar(150) NOT NULL,
        "head_doctor_id" uuid,
        "location_floor" varchar(50),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_department_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
      );
    `);

    // 6. staff_profiles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE,
        "hospital_id" uuid NOT NULL,
        "department_id" uuid NOT NULL,
        "staff_type" varchar(30) NOT NULL,
        "shift_schedule" varchar(50),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE
      );
    `);

    // 7. doctor_departments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctor_departments" (
        "doctor_id" uuid NOT NULL,
        "department_id" uuid NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_doctor_departments" PRIMARY KEY ("doctor_id", "department_id"),
        CONSTRAINT "FK_docdept_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_docdept_dept" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE
      );
    `);

    // 8. doctor_schedules
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctor_schedules" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "doctor_id" uuid NOT NULL,
        "day_of_week" smallint NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "slot_duration_mins" integer NOT NULL DEFAULT 30,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_doctor_schedules_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schedule_doctor" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE
      );
    `);

    // 9. encounters
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "encounters" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "attending_doctor_id" uuid NOT NULL,
        "appointment_id" uuid,
        "admission_id" uuid,
        "type" varchar(20) NOT NULL,
        "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_time" TIMESTAMP WITH TIME ZONE,
        "status" varchar(20) NOT NULL DEFAULT 'IN_PROGRESS',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_encounters_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_encounter_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
      );
    `);

    // 10. prescription_items
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prescription_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "prescription_id" uuid NOT NULL,
        "medicine_name" varchar(200) NOT NULL,
        "dosage" varchar(50) NOT NULL,
        "frequency" varchar(50) NOT NULL,
        "duration_days" integer NOT NULL,
        "route" varchar(50) NOT NULL DEFAULT 'ORAL',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prescription_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_item_prescription" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE
      );
    `);

    // 11. wards
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wards" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" varchar(30) NOT NULL,
        "daily_rate" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wards_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ward_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ward_branch" FOREIGN KEY ("branch_id") REFERENCES "hospital_branches"("id") ON DELETE CASCADE
      );
    `);

    // 12. beds
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "beds" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "ward_id" uuid NOT NULL,
        "bed_number" varchar(30) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'AVAILABLE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_beds_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bed_ward" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE CASCADE
      );
    `);

    // 13. admissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "bed_id" uuid NOT NULL,
        "admitting_doctor_id" uuid NOT NULL,
        "admitted_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "discharged_at" TIMESTAMP WITH TIME ZONE,
        "discharge_summary" text,
        "status" varchar(20) NOT NULL DEFAULT 'ADMITTED',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_admission_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_admission_bed" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE CASCADE
      );
    `);

    // 14. invoices
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid NOT NULL,
        "patient_id" uuid NOT NULL,
        "encounter_id" uuid,
        "invoice_number" varchar(50) NOT NULL UNIQUE,
        "subtotal" numeric(10,2) NOT NULL,
        "tax_amount" numeric(10,2) NOT NULL DEFAULT 0.00,
        "discount_amount" numeric(10,2) NOT NULL DEFAULT 0.00,
        "total_amount" numeric(10,2) NOT NULL,
        "paid_amount" numeric(10,2) NOT NULL DEFAULT 0.00,
        "payment_status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoices_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_hospital" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE CASCADE
      );
    `);

    // 15. invoice_items
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "invoice_id" uuid NOT NULL,
        "item_type" varchar(30) NOT NULL,
        "description" varchar(255) NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "unit_price" numeric(10,2) NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoice_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_item_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE
      );
    `);

    // 16. payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "invoice_id" uuid NOT NULL,
        "payment_method" varchar(30) NOT NULL,
        "transaction_ref" varchar(100),
        "amount" numeric(10,2) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'SUCCESS',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE
      );
    `);

    // 17. audit_logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "hospital_id" uuid,
        "actor_id" uuid,
        "actor_role" varchar(50) NOT NULL,
        "action" varchar(50) NOT NULL,
        "entity_name" varchar(50) NOT NULL,
        "entity_id" uuid,
        "ip_address" varchar(45),
        "changes_before" jsonb,
        "changes_after" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      );
    `);

    // Add optional foreign key columns to existing tables if missing
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "medical_license" varchar(100);`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "type" varchar(20) DEFAULT 'IN_PERSON';`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "encounter_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "subjective" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "objective" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "assessment" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD COLUMN IF NOT EXISTS "plan" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "encounter_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "diagnosis" text;`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "valid_until" date;`,
    );
    await queryRunner.query(
      `ALTER TABLE "insurance_claims" ADD COLUMN IF NOT EXISTS "hospital_id" uuid;`,
    );
    await queryRunner.query(
      `ALTER TABLE "insurance_claims" ADD COLUMN IF NOT EXISTS "invoice_id" uuid;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "beds" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wards" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prescription_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "encounters" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctor_schedules" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctor_departments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_profiles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_profiles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hospital_branches" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hospitals" CASCADE;`);
  }
}
