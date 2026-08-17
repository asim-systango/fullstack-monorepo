import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable1786623000000 implements MigrationInterface {
  name = 'CreateActivitiesTable1786623000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."activities_activitytype_enum" AS ENUM('NOTE', 'TASK', 'CALL', 'MEETING', 'EMAIL', 'FOLLOW_UP')`,
    );
    await queryRunner.query(`
            CREATE TABLE "activities" (
                "id" character(26) NOT NULL,
                "organizationId" character(26) NOT NULL,
                "leadId" character(26),
                "dealId" character(26),
                "stage" character varying(50) NOT NULL,
                "activityType" "public"."activities_activitytype_enum" NOT NULL DEFAULT 'NOTE',
                "title" character varying(255) NOT NULL,
                "description" text,
                "dueAt" bigint,
                "completedAt" bigint,
                "createdBy" character(26) NOT NULL,
                "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                CONSTRAINT "CHK_c8a7b6a4f91bb7b4c4f3d2f9d6" CHECK ("leadId" IS NOT NULL OR "dealId" IS NOT NULL),
                CONSTRAINT "PK_activities_id" PRIMARY KEY ("id")
            )
        `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_organizationId" ON "activities" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_leadId" ON "activities" ("leadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_dealId" ON "activities" ("dealId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_stage" ON "activities" ("stage") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_activityType" ON "activities" ("activityType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_dueAt" ON "activities" ("dueAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_completedAt" ON "activities" ("completedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_createdBy" ON "activities" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_createdAt" ON "activities" ("createdAt") `,
    );

    // Composite Indexes (as suggested by the user)
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_org_lead" ON "activities" ("organizationId", "leadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_org_deal" ON "activities" ("organizationId", "dealId") `,
    );

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_leadId" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_dealId" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_activities_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_createdBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_dealId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_leadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_activities_organizationId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_activities_org_deal"`);
    await queryRunner.query(`DROP INDEX "IDX_activities_org_lead"`);
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TYPE "public"."activities_activitytype_enum"`);
  }
}
