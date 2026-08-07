import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDomainTables1785932184726 implements MigrationInterface {
  name = 'CreateDomainTables1785932184726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctor_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "specialization" character varying(100) NOT NULL, "qualification" character varying(100) NOT NULL, "experienceYears" integer NOT NULL DEFAULT '0', "consultationFee" numeric(10,2) NOT NULL DEFAULT '0', "biography" text, "profileImage" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_a798afca9436b00dac80f911a83" UNIQUE ("userId"), CONSTRAINT "PK_b07c128005f6a0d0135d6e7353b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43a8bbfe9aeeb33c5c877f35a0" ON "doctor_profiles" ("specialization") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."slots_status_enum" AS ENUM('AVAILABLE', 'BOOKED', 'BLOCKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "doctorId" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."slots_status_enum" NOT NULL DEFAULT 'AVAILABLE', CONSTRAINT "CHK_af51e9f967908bf80b471e1565" CHECK ("starts_at" < "ends_at"), CONSTRAINT "PK_8b553bb1941663b63fd38405e42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58f86e95ea77a4c7c4aec98e6a" ON "slots" ("doctorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7275755ee7ff5a96f07181b3f9" ON "slots" ("starts_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d162070466b4028236f541f85b" ON "slots" ("status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('SCHEDULED', 'CANCELLED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "patientId" uuid NOT NULL, "slotId" uuid NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'SCHEDULED', "reason" text, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_074c4e87da10ac958c44c9562f3" UNIQUE ("slotId"), CONSTRAINT "REL_074c4e87da10ac958c44c9562f" UNIQUE ("slotId"), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13c2e57cb81b44f062ba24df57" ON "appointments" ("patientId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3007a47d97a542e63b3308a69b" ON "appointments" ("status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "prescriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "appointmentId" uuid NOT NULL, "medicines" jsonb NOT NULL DEFAULT '[]', "instructions" text, CONSTRAINT "UQ_5c22ff49adf67549a85db811a72" UNIQUE ("appointmentId"), CONSTRAINT "REL_5c22ff49adf67549a85db811a7" UNIQUE ("appointmentId"), CONSTRAINT "PK_097b2cc2f2b7e56825468188503" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "medical_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointmentId" uuid NOT NULL, "doctorId" uuid NOT NULL, "notes" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2c2f273f76f8de7392f07d930c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2dcec888a8f6ca8f8bb2a86334" ON "medical_notes" ("appointmentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71d222a8232b6d26ea7a384dff" ON "medical_notes" ("doctorId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" ADD CONSTRAINT "FK_58f86e95ea77a4c7c4aec98e6a2" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_074c4e87da10ac958c44c9562f3" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_5c22ff49adf67549a85db811a72" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD CONSTRAINT "FK_2dcec888a8f6ca8f8bb2a863340" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" ADD CONSTRAINT "FK_71d222a8232b6d26ea7a384dffa" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_notes" DROP CONSTRAINT "FK_71d222a8232b6d26ea7a384dffa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medical_notes" DROP CONSTRAINT "FK_2dcec888a8f6ca8f8bb2a863340"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_5c22ff49adf67549a85db811a72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_074c4e87da10ac958c44c9562f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" DROP CONSTRAINT "FK_58f86e95ea77a4c7c4aec98e6a2"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_71d222a8232b6d26ea7a384dff"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2dcec888a8f6ca8f8bb2a86334"`);
    await queryRunner.query(`DROP TABLE "medical_notes"`);
    await queryRunner.query(`DROP TABLE "prescriptions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3007a47d97a542e63b3308a69b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_13c2e57cb81b44f062ba24df57"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d162070466b4028236f541f85b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7275755ee7ff5a96f07181b3f9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_58f86e95ea77a4c7c4aec98e6a"`);
    await queryRunner.query(`DROP TABLE "slots"`);
    await queryRunner.query(`DROP TYPE "public"."slots_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_43a8bbfe9aeeb33c5c877f35a0"`);
    await queryRunner.query(`DROP TABLE "doctor_profiles"`);
  }
}
