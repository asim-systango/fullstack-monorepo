import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobs1786600266946 implements MigrationInterface {
    name = 'CreateJobs1786600266946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('open', 'closed')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "title" character varying NOT NULL, "location" character varying NOT NULL, "description" text NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'open', "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f803a854cd07320ee634d8887f" ON "jobs" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0c30e3eb9649fe7fbcd336a63" ON "jobs" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_69984b8a08737609c925c67326" ON "jobs" ("deleted_at") `);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_087a773c50525e348e26188e7cc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_087a773c50525e348e26188e7cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69984b8a08737609c925c67326"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0c30e3eb9649fe7fbcd336a63"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f803a854cd07320ee634d8887f"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    }

}
