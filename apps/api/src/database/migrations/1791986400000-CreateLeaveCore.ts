import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeaveCore1791986400000 implements MigrationInterface {
  name = 'CreateLeaveCore1791986400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);

    await queryRunner.query(`
      CREATE TABLE "leave_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(60) NOT NULL,
        "defaultDays" integer NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        CONSTRAINT "PK_leave_types" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_leave_types_default_days" CHECK ("defaultDays" BETWEEN 0 AND 366)
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_leave_types_name_active"
        ON "leave_types" (lower("name")) WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "leave_balances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "leaveTypeId" uuid NOT NULL,
        "year" integer NOT NULL,
        "totalDays" integer NOT NULL,
        "usedDays" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leave_balances" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_leave_balances_user_type_year" UNIQUE ("userId", "leaveTypeId", "year"),
        CONSTRAINT "CHK_leave_balances_used_lte_total" CHECK ("usedDays" <= "totalDays"),
        CONSTRAINT "CHK_leave_balances_non_negative" CHECK ("usedDays" >= 0 AND "totalDays" >= 0),
        CONSTRAINT "FK_leave_balances_leave_type" FOREIGN KEY ("leaveTypeId")
          REFERENCES "leave_types"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "leave_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "leaveTypeId" uuid NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "days" integer NOT NULL,
        "reason" character varying(500) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "managerId" uuid,
        "managerComment" character varying(500),
        "decidedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        CONSTRAINT "PK_leave_requests" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_leave_requests_dates" CHECK ("endDate" >= "startDate"),
        CONSTRAINT "CHK_leave_requests_days" CHECK ("days" > 0),
        CONSTRAINT "CHK_leave_requests_same_year"
          CHECK (EXTRACT(YEAR FROM "startDate") = EXTRACT(YEAR FROM "endDate")),
        CONSTRAINT "CHK_leave_requests_status"
          CHECK ("status" IN ('pending', 'approved', 'rejected', 'cancelled')),
        -- same user can't have overlapping pending/approved leave
        CONSTRAINT "EXC_leave_requests_no_overlap" EXCLUDE USING gist (
          "userId" WITH =,
          daterange("startDate", "endDate", '[]') WITH &&
        ) WHERE ("status" IN ('pending', 'approved') AND "deletedAt" IS NULL),
        CONSTRAINT "FK_leave_requests_leave_type" FOREIGN KEY ("leaveTypeId")
          REFERENCES "leave_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_user_status" ON "leave_requests" ("userId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_status_start" ON "leave_requests" ("status", "startDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_leave_type" ON "leave_requests" ("leaveTypeId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "leave_requests"`);
    await queryRunner.query(`DROP TABLE "leave_balances"`);
    await queryRunner.query(`DROP TABLE "leave_types"`);
  }
}
