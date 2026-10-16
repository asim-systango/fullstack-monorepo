import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetMaxActiveLoansToTwo1792000000000 implements MigrationInterface {
  name = 'SetMaxActiveLoansToTwo1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "app_setting" SET "value" = '2' WHERE "key" = 'max_active_loans'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "app_setting" SET "value" = '5' WHERE "key" = 'max_active_loans'`,
    );
  }
}
