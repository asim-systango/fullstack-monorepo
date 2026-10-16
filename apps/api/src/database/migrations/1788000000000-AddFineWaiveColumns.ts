import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFineWaiveColumns1788000000000 implements MigrationInterface {
  name = 'AddFineWaiveColumns1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fine" ADD "waived_reason" text`);
    await queryRunner.query(
      `ALTER TABLE "fine" ADD "waived_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "fine" ADD "waived_by" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fine" DROP COLUMN "waived_by"`);
    await queryRunner.query(`ALTER TABLE "fine" DROP COLUMN "waived_at"`);
    await queryRunner.query(`ALTER TABLE "fine" DROP COLUMN "waived_reason"`);
  }
}
