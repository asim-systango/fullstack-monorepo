import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveLoanUserTitleUnique1793000000000 implements MigrationInterface {
  name = 'AddActiveLoanUserTitleUnique1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_loan_active_user_title" ON "loan" ("user_id", "book_id") WHERE "returned_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."uq_loan_active_user_title"`);
  }
}
