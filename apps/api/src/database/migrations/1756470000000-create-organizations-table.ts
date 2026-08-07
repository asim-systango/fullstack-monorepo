import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationsTable1756470000000 implements MigrationInterface {
  name = 'CreateOrganizationsTable1756470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" (
        "id" character(26) NOT NULL,
        "name" character varying(150) NOT NULL,
        "slug" character varying(160) NOT NULL,
        "primaryDomain" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone" character varying(30) NOT NULL,
        "industry" character varying(100) NOT NULL,
        "logoUrl" text,
        "website" character varying(255),
        "address" text,
        "timezone" character varying(100) NOT NULL DEFAULT 'Asia/Kolkata',
        "status" "public"."organizations_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "createdBy" character(26),
        "ownerId" character(26),
        "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_organizations_primaryDomain" UNIQUE ("primaryDomain"),
        CONSTRAINT "PK_organizations_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_name" ON "organizations" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_slug" ON "organizations" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_industry" ON "organizations" ("industry")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_email" ON "organizations" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_status" ON "organizations" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_createdBy" ON "organizations" ("createdBy")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_ownerId" ON "organizations" ("ownerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_createdAt" ON "organizations" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_ownerId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_createdBy"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_industry"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_organizations_name"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "public"."organizations_status_enum"`);
  }
}
