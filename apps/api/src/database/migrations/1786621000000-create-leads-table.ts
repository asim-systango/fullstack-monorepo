import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeadsTable1786621000000 implements MigrationInterface {
  name = 'CreateLeadsTable1786621000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."leads_source_enum" AS ENUM('WEBSITE', 'MANUAL', 'IMPORT', 'API', 'REFERRAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leads_stage_enum" AS ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')`,
    );
    await queryRunner.query(`
            CREATE TABLE "leads" (
                "id" character(26) NOT NULL,
                "organizationId" character(26) NOT NULL,
                "contactId" character(26) NOT NULL,
                "ownerId" character(26),
                "assignedBy" character(26),
                "title" character varying(255) NOT NULL,
                "description" text,
                "source" "public"."leads_source_enum" NOT NULL DEFAULT 'MANUAL',
                "stage" "public"."leads_stage_enum" NOT NULL DEFAULT 'NEW',
                "qualifiedAt" bigint,
                "convertedAt" bigint,
                "lostReason" text,
                "createdBy" character(26) NOT NULL,
                "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                CONSTRAINT "PK_leads_id" PRIMARY KEY ("id")
            )
        `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_organizationId" ON "leads" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_contactId" ON "leads" ("contactId") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_leads_ownerId" ON "leads" ("ownerId") `);
    await queryRunner.query(`CREATE INDEX "IDX_leads_title" ON "leads" ("title") `);
    await queryRunner.query(`CREATE INDEX "IDX_leads_source" ON "leads" ("source") `);
    await queryRunner.query(`CREATE INDEX "IDX_leads_stage" ON "leads" ("stage") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_createdBy" ON "leads" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leads_createdAt" ON "leads" ("createdAt") `,
    );

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_contactId" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_ownerId" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_assignedBy" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_createdBy"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_assignedBy"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_ownerId"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_contactId"`);
    await queryRunner.query(
      `ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_organizationId"`,
    );
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TYPE "public"."leads_stage_enum"`);
    await queryRunner.query(`DROP TYPE "public"."leads_source_enum"`);
  }
}
