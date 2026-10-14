import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResumeMetas1786700000002 implements MigrationInterface {
  name = 'CreateResumeMetas1786700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "resume_metas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_user_id" character varying NOT NULL, "url" character varying NOT NULL, "label" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_resume_metas" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_resume_metas_candidate" ON "resume_metas" ("candidate_user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_resume_metas_candidate"`);
    await queryRunner.query(`DROP TABLE "resume_metas"`);
  }
}
