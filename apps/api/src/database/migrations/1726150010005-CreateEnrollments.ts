import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnrollments1726150010005 implements MigrationInterface {
  name = 'CreateEnrollments1726150010005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "enrollments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "courseId" uuid NOT NULL,
        "studentId" uuid NOT NULL,
        "enrolledAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enrollments" PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_enrollments_course_student" ON "enrollments" ("courseId", "studentId");`,
    );
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD CONSTRAINT "FK_enrollments_course" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD CONSTRAINT "FK_enrollments_student" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_student";`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_course";`,
    );
    await queryRunner.query(`DROP INDEX "IDX_enrollments_course_student";`);
    await queryRunner.query(`DROP TABLE "enrollments";`);
  }
}
