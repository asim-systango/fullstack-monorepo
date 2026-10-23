import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDealsTable1786622000000 implements MigrationInterface {
  name = 'CreateDealsTable1786622000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."deals_stage_enum" AS ENUM('OPEN', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST')`,
    );
    await queryRunner.query(`
            CREATE TABLE "deals" (
                "id" character(26) NOT NULL,
                "organizationId" character(26) NOT NULL,
                "leadId" character(26) NOT NULL,
                "contactId" character(26) NOT NULL,
                "ownerId" character(26) NOT NULL,
                "title" character varying(255) NOT NULL,
                "description" text,
                "amount" numeric(18,2) NOT NULL DEFAULT '0',
                "stage" "public"."deals_stage_enum" NOT NULL DEFAULT 'OPEN',
                "probability" smallint NOT NULL DEFAULT '0',
                "expectedCloseDate" date,
                "wonAt" bigint,
                "lostAt" bigint,
                "lostReason" text,
                "createdBy" character(26) NOT NULL,
                "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                CONSTRAINT "UQ_deals_leadId" UNIQUE ("leadId"),
                CONSTRAINT "PK_deals_id" PRIMARY KEY ("id")
            )
        `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_deals_organizationId" ON "deals" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_deals_contactId" ON "deals" ("contactId") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_deals_ownerId" ON "deals" ("ownerId") `);
    await queryRunner.query(`CREATE INDEX "IDX_deals_title" ON "deals" ("title") `);
    await queryRunner.query(`CREATE INDEX "IDX_deals_stage" ON "deals" ("stage") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_deals_expectedCloseDate" ON "deals" ("expectedCloseDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_deals_createdBy" ON "deals" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_deals_createdAt" ON "deals" ("createdAt") `,
    );

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_leadId" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_contactId" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_ownerId" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "deals" ADD CONSTRAINT "FK_deals_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_createdBy"`);
    await queryRunner.query(`ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_ownerId"`);
    await queryRunner.query(`ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_contactId"`);
    await queryRunner.query(`ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_leadId"`);
    await queryRunner.query(
      `ALTER TABLE "deals" DROP CONSTRAINT "FK_deals_organizationId"`,
    );
    await queryRunner.query(`DROP TABLE "deals"`);
    await queryRunner.query(`DROP TYPE "public"."deals_stage_enum"`);
  }
}
