import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzes1726150010003 implements MigrationInterface {
  name = 'CreateQuizzes1726150010003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "courseId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "dueAt" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quizzes" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`
      ALTER TABLE "quizzes"
        ADD CONSTRAINT "FK_quizzes_course" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_quizzes_course";`);
    await queryRunner.query(`DROP TABLE "quizzes";`);
  }
}
