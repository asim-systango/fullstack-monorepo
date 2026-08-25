import { MigrationInterface, QueryRunner } from 'typeorm';

export class FitnessTrackerInit1786367682199 implements MigrationInterface {
  name = 'FitnessTrackerInit1786367682199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "exercise_log_id" uuid NOT NULL, "reps" integer NOT NULL, "weight_kg" numeric(6,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5d15ed8b3e2a5cb6e9c9921d056" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "exercise_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workout_id" uuid NOT NULL, "exercise_name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_32076bf978e4169be16e25bf8dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workouts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "title" character varying NOT NULL, "performed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5b2319bf64a674d40237dbb1697" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "personal_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "exercise_name" character varying NOT NULL, "best_weight_kg" numeric(6,2) NOT NULL, "best_reps" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_personal_records_user_exercise" UNIQUE ("user_id", "exercise_name"), CONSTRAINT "PK_ba9cfbd0af0e7e81265ea1b72a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sets" ADD CONSTRAINT "FK_e774153ba40009a360726194fb1" FOREIGN KEY ("exercise_log_id") REFERENCES "exercise_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercise_logs" ADD CONSTRAINT "FK_a6b43906ce73f686a42ccde664a" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exercise_logs" DROP CONSTRAINT "FK_a6b43906ce73f686a42ccde664a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sets" DROP CONSTRAINT "FK_e774153ba40009a360726194fb1"`,
    );
    await queryRunner.query(`DROP TABLE "personal_records"`);
    await queryRunner.query(`DROP TABLE "workouts"`);
    await queryRunner.query(`DROP TABLE "exercise_logs"`);
    await queryRunner.query(`DROP TABLE "sets"`);
  }
}
