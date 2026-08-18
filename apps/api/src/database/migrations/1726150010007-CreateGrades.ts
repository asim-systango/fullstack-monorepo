import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGrades1726150010007 implements MigrationInterface {
  name = 'CreateGrades1726150010007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "grades" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "submissionId" uuid NOT NULL,
        "graderId" uuid NOT NULL,
        "score" integer NOT NULL,
        "feedback" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grades" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_grades_submission_id" UNIQUE ("submissionId")
      );
    `);
    await queryRunner.query(`
      ALTER TABLE "grades"
        ADD CONSTRAINT "FK_grades_submission" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE "grades"
        ADD CONSTRAINT "FK_grades_grader" FOREIGN KEY ("graderId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_grades_grader";`);
    await queryRunner.query(
      `ALTER TABLE "grades" DROP CONSTRAINT "FK_grades_submission";`,
    );
    await queryRunner.query(`DROP TABLE "grades";`);
  }
}
