import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourses1726150010001 implements MigrationInterface {
  name = 'CreateCourses1726150010001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "instructor_id" uuid NOT NULL,
        "published_at" timestamptz,
        "deleted_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_courses" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_courses_slug" ON "courses" ("slug");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_courses_slug";`);
    await queryRunner.query(`DROP TABLE "courses";`);
  }
}
