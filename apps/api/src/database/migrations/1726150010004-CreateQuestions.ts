import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestions1726150010004 implements MigrationInterface {
  name = 'CreateQuestions1726150010004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "questions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "quizId" uuid NOT NULL,
        "type" character varying(20) NOT NULL,
        "prompt" text NOT NULL,
        "correctAnswer" text,
        "choices" jsonb,
        "position" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_questions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_questions_type" CHECK ("type" IN ('mcq', 'short_answer'))
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_questions_quiz_position" ON "questions" ("quizId", "position");`,
    );
    await queryRunner.query(`
      ALTER TABLE "questions"
        ADD CONSTRAINT "FK_questions_quiz" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_questions_quiz";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_questions_quiz_position";`);
    await queryRunner.query(`DROP TABLE "questions";`);
  }
}
