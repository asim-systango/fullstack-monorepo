import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoanEmailSentFlags1790000000000 implements MigrationInterface {
  name = 'AddLoanEmailSentFlags1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "reminder_sent_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "overdue_notified_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "overdue_notified_at"`);
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "reminder_sent_at"`);
  }
}
