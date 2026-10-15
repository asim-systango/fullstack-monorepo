import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHolidays1791986400001 implements MigrationInterface {
  name = 'CreateHolidays1791986400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "holidays" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "date" date NOT NULL,
        "name" character varying(80) NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_holidays" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_holidays_date" UNIQUE ("date")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "holidays"`);
  }
}
