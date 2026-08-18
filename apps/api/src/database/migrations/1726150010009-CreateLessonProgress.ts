import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLessonProgress1726150010009 implements MigrationInterface {
  name = 'CreateLessonProgress1726150010009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lesson_progress" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lessonId" uuid NOT NULL,
        "studentId" uuid NOT NULL,
        "completed" boolean NOT NULL DEFAULT false,
        "completedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lesson_progress" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_lesson_progress_lesson_student" ON "lesson_progress" ("lessonId", "studentId");`,
    );
    await queryRunner.query(`
      ALTER TABLE "lesson_progress"
        ADD CONSTRAINT "FK_lesson_progress_lesson" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE "lesson_progress"
        ADD CONSTRAINT "FK_lesson_progress_student" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP CONSTRAINT "FK_lesson_progress_student";`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP CONSTRAINT "FK_lesson_progress_lesson";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_lesson_progress_lesson_student";`);
    await queryRunner.query(`DROP TABLE "lesson_progress";`);
  }
}
