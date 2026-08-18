import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubmissions1726150010006 implements MigrationInterface {
  name = 'CreateSubmissions1726150010006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "submissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "quizId" uuid NOT NULL,
        "studentId" uuid NOT NULL,
        "answers" jsonb NOT NULL,
        "submittedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_submissions" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_submissions_quiz_student" ON "submissions" ("quizId", "studentId");`,
    );
    await queryRunner.query(`
      ALTER TABLE "submissions"
        ADD CONSTRAINT "FK_submissions_quiz" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE "submissions"
        ADD CONSTRAINT "FK_submissions_student" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_submissions_student";`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_submissions_quiz";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_submissions_quiz_student";`);
    await queryRunner.query(`DROP TABLE "submissions";`);
  }
}
