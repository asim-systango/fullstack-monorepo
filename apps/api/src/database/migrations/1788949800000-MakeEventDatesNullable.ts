import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEventDatesNullable1788949800000 implements MigrationInterface {
  name = 'MakeEventDatesNullable1788949800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "startDate" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "endDate" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "startDate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "endDate" SET NOT NULL`,
    );
  }
}
