import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitLibrarySchema1786352123381 implements MigrationInterface {
  name = 'InitLibrarySchema1786352123381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(60) NOT NULL, "value" text NOT NULL, "value_type" character varying(20) NOT NULL DEFAULT 'integer', "description" text, "updated_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0d66bfb0d9f93124a4549d21af0" UNIQUE ("key"), CONSTRAINT "PK_10b1e1bf64917bdb640f8eedb31" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(300) NOT NULL, "author" character varying(200) NOT NULL, "isbn" character varying(20) NOT NULL, "description" text, "published_year" smallint, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_book_catalog_active" ON "book" ("title", "author", "isbn") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "book_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "queue_position" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fulfilled_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_reservation_active_queue" ON "reservation" ("book_id", "created_at") WHERE "status" = 'active'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_reservation_active_user_book" ON "reservation" ("user_id", "book_id") WHERE "status" = 'active'`,
    );
    await queryRunner.query(
      `CREATE TABLE "member_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "suspended_reason" text, "suspended_at" TIMESTAMP WITH TIME ZONE, "suspended_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_785f7376fc8bec9c278a0fdee0f" UNIQUE ("user_id"), CONSTRAINT "PK_157ca6e25e9cbd657a2302fb12d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_copy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "book_id" uuid NOT NULL, "barcode" character varying(50) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'available', "acquired_at" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_cae499666e06981a66a420f7d93" UNIQUE ("barcode"), CONSTRAINT "PK_ef16f7a75bc656c5486264959bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_book_copy_barcode" ON "book_copy" ("barcode") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_book_copy_book_status" ON "book_copy" ("book_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "loan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "book_copy_id" uuid NOT NULL, "book_id" uuid NOT NULL, "borrowed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "due_date" date NOT NULL, "returned_at" TIMESTAMP WITH TIME ZONE, "checked_out_by" uuid NOT NULL, "returned_to" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_8c0bb1225eae06a0a353c4bcdf" CHECK ("returned_at" IS NULL OR "returned_at" >= "borrowed_at"), CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_loan_active_user_due" ON "loan" ("user_id", "due_date") WHERE "returned_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_loan_active_copy" ON "loan" ("book_copy_id") WHERE "returned_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "fine" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "loan_id" uuid NOT NULL, "user_id" uuid NOT NULL, "days_overdue" integer NOT NULL, "amount_cents" integer NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'unpaid', "paid_at" TIMESTAMP WITH TIME ZONE, "marked_paid_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_fa14699db4fcb454d0d20cf8d07" UNIQUE ("loan_id"), CONSTRAINT "REL_fa14699db4fcb454d0d20cf8d0" UNIQUE ("loan_id"), CONSTRAINT "CHK_74f3a2468feff43a62f5e9d871" CHECK ("amount_cents" >= 0 AND "days_overdue" >= 0), CONSTRAINT "PK_13acc5a2e27270b02717cfa9b30" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation" ADD CONSTRAINT "FK_9449953ea389d07cbef0b415c12" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_copy" ADD CONSTRAINT "FK_a3365d29e50bf551ff93777d4cb" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ADD CONSTRAINT "FK_a53a63e615cbb21311e53b9b696" FOREIGN KEY ("book_copy_id") REFERENCES "book_copy"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ADD CONSTRAINT "FK_f6371fa812ea961c326e0ef2da4" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fine" ADD CONSTRAINT "FK_fa14699db4fcb454d0d20cf8d07" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fine" DROP CONSTRAINT "FK_fa14699db4fcb454d0d20cf8d07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" DROP CONSTRAINT "FK_f6371fa812ea961c326e0ef2da4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" DROP CONSTRAINT "FK_a53a63e615cbb21311e53b9b696"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_copy" DROP CONSTRAINT "FK_a3365d29e50bf551ff93777d4cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation" DROP CONSTRAINT "FK_9449953ea389d07cbef0b415c12"`,
    );
    await queryRunner.query(`DROP TABLE "fine"`);
    await queryRunner.query(`DROP INDEX "public"."uq_loan_active_copy"`);
    await queryRunner.query(`DROP INDEX "public"."idx_loan_active_user_due"`);
    await queryRunner.query(`DROP TABLE "loan"`);
    await queryRunner.query(`DROP INDEX "public"."idx_book_copy_book_status"`);
    await queryRunner.query(`DROP INDEX "public"."uq_book_copy_barcode"`);
    await queryRunner.query(`DROP TABLE "book_copy"`);
    await queryRunner.query(`DROP TABLE "member_profile"`);
    await queryRunner.query(`DROP INDEX "public"."uq_reservation_active_user_book"`);
    await queryRunner.query(`DROP INDEX "public"."idx_reservation_active_queue"`);
    await queryRunner.query(`DROP TABLE "reservation"`);
    await queryRunner.query(`DROP INDEX "public"."idx_book_catalog_active"`);
    await queryRunner.query(`DROP TABLE "book"`);
    await queryRunner.query(`DROP TABLE "app_setting"`);
  }
}
