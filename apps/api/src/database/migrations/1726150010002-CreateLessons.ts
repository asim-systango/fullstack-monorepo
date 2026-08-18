import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLessons1726150010002 implements MigrationInterface {
  name = 'CreateLessons1726150010002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "courseId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "content" text,
        "position" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lessons" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_lessons_course_position" ON "lessons" ("courseId", "position");`,
    );
    await queryRunner.query(`
      ALTER TABLE "lessons"
        ADD CONSTRAINT "FK_lessons_course" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_course";`);
    await queryRunner.query(`DROP INDEX "IDX_lessons_course_position";`);
    await queryRunner.query(`DROP TABLE "lessons";`);
  }
}
