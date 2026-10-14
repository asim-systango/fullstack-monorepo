import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplications1786616509008 implements MigrationInterface {
    name = 'CreateApplications1786616509008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."applications_status_enum" AS ENUM('submitted', 'reviewing', 'rejected', 'hired')`);
        await queryRunner.query(`CREATE TABLE "applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "candidate_user_id" character varying NOT NULL, "status" "public"."applications_status_enum" NOT NULL DEFAULT 'submitted', "coverLetter" text NOT NULL, "resumeUrl" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c228660a65340acaf7c6f19a84f" UNIQUE ("job_id", "candidate_user_id"), CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e2e875c54688e44d91a4b538a" ON "applications" ("candidate_user_id") `);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_8aba14d7f098c23ba06d8693235" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_8aba14d7f098c23ba06d8693235"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e2e875c54688e44d91a4b538a"`);
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    }

}
