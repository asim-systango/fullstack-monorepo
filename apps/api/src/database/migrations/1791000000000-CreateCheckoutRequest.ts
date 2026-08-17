import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCheckoutRequest1791000000000 implements MigrationInterface {
  name = 'CreateCheckoutRequest1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "checkout_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "book_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "loan_id" uuid, "book_copy_id" uuid, "issued_by" uuid, "rejected_reason" text, "fulfilled_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "rejected_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_checkout_request_fulfilled_loan" CHECK ("status" <> 'fulfilled' OR "loan_id" IS NOT NULL), CONSTRAINT "PK_checkout_request" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_checkout_request_pending_user_book" ON "checkout_request" ("user_id", "book_id") WHERE "status" = 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_checkout_request_status_created" ON "checkout_request" ("status", "created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_request" ADD CONSTRAINT "FK_checkout_request_book" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_request" ADD CONSTRAINT "FK_checkout_request_loan" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_request" ADD CONSTRAINT "FK_checkout_request_copy" FOREIGN KEY ("book_copy_id") REFERENCES "book_copy"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_request" DROP CONSTRAINT "FK_checkout_request_copy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_request" DROP CONSTRAINT "FK_checkout_request_loan"`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_request" DROP CONSTRAINT "FK_checkout_request_book"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_checkout_request_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_checkout_request_pending_user_book"`,
    );
    await queryRunner.query(`DROP TABLE "checkout_request"`);
  }
}
