import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookmarks1786700000001 implements MigrationInterface {
  name = 'CreateBookmarks1786700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bookmarks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_bookmarks_user_job" UNIQUE ("user_id", "job_id"), CONSTRAINT "PK_bookmarks" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_bookmarks_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_bookmarks_job"`);
    await queryRunner.query(`DROP TABLE "bookmarks"`);
  }
}
