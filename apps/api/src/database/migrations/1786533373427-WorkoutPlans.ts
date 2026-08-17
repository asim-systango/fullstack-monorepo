import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkoutPlans1786533373427 implements MigrationInterface {
  name = 'WorkoutPlans1786533373427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plan_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_id" uuid NOT NULL, "day_label" character varying NOT NULL, "order" integer NOT NULL, "exercises" jsonb NOT NULL, CONSTRAINT "PK_f0213179aed9b137f931c76c912" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workout_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "title" character varying NOT NULL, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9ae1bdd02db446a7541e2e5b161" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_days" ADD CONSTRAINT "FK_79cd2489a04677ca191109f5bbd" FOREIGN KEY ("plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plan_days" DROP CONSTRAINT "FK_79cd2489a04677ca191109f5bbd"`,
    );
    await queryRunner.query(`DROP TABLE "workout_plans"`);
    await queryRunner.query(`DROP TABLE "plan_days"`);
  }
}
