import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoachAthletes1786534735654 implements MigrationInterface {
  name = 'CoachAthletes1786534735654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coach_athletes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "coach_user_id" character varying NOT NULL, "athlete_user_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_coach_athletes_coach_athlete" UNIQUE ("coach_user_id", "athlete_user_id"), CONSTRAINT "PK_4b794b05edeb4483fe0698246f4" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "coach_athletes"`);
  }
}
