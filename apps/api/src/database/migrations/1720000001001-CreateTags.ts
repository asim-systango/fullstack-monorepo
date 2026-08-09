import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTags1720000001001 implements MigrationInterface {
  name = 'CreateTags1720000001001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "normalized_name" character varying NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_normalized_name" UNIQUE ("normalized_name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
