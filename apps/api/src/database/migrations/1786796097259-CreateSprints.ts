import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSprints1786796097259 implements MigrationInterface {
  name = 'CreateSprints1786796097259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sprints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "project_id" uuid NOT NULL, "name" character varying NOT NULL, "start_date" date, "end_date" date, CONSTRAINT "PK_6800aa2e0f508561812c4b9afb4" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sprints"`);
  }
}
