import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptionalSetWeight1786620000000 implements MigrationInterface {
  name = 'OptionalSetWeight1786620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sets" ALTER COLUMN "weight_kg" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "personal_records" ALTER COLUMN "best_weight_kg" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "personal_records" ALTER COLUMN "best_weight_kg" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "sets" ALTER COLUMN "weight_kg" SET NOT NULL`);
  }
}
