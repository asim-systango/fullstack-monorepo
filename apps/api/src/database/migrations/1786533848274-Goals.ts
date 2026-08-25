import { MigrationInterface, QueryRunner } from 'typeorm';

export class Goals1786533848274 implements MigrationInterface {
  name = 'Goals1786533848274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "exercise_name" character varying NOT NULL, "target_weight_kg" numeric(6,2) NOT NULL, "target_reps" integer, "target_date" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "goals"`);
  }
}
