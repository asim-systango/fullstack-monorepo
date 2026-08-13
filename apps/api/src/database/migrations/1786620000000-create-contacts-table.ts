import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactsTable1786620000000 implements MigrationInterface {
  name = 'CreateContactsTable1786620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contacts_source_enum" AS ENUM('WEBSITE', 'MANUAL', 'IMPORT', 'API', 'REFERRAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contacts_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(`
            CREATE TABLE "contacts" (
                "id" character(26) NOT NULL,
                "organizationId" character(26) NOT NULL,
                "firstName" character varying(100) NOT NULL,
                "lastName" character varying(100) NOT NULL,
                "email" character varying(255),
                "phone" character varying(20) NOT NULL,
                "companyName" character varying(150),
                "designation" character varying(100),
                "source" "public"."contacts_source_enum" NOT NULL DEFAULT 'MANUAL',
                "status" "public"."contacts_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "createdBy" character(26) NOT NULL,
                "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * (1000)),
                CONSTRAINT "PK_contacts_id" PRIMARY KEY ("id")
            )
        `);

    // Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_contacts_organizationId" ON "contacts" ("organizationId") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_contacts_email" ON "contacts" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_contacts_phone" ON "contacts" ("phone") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_contacts_companyName" ON "contacts" ("companyName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contacts_source" ON "contacts" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contacts_status" ON "contacts" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contacts_createdBy" ON "contacts" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contacts_createdAt" ON "contacts" ("createdAt") `,
    );

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_contacts_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_contacts_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_contacts_createdBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_contacts_organizationId"`,
    );
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TYPE "public"."contacts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."contacts_source_enum"`);
  }
}
