import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1756450000000 implements MigrationInterface {
  name = 'CreateUsersTable1756450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" character(26) NOT NULL,
        "organizationId" character(26),
        "roleId" character(26) NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "phone" character varying(30),
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "isPasswordChangeRequired" boolean NOT NULL DEFAULT true,
        "lastLoginAt" bigint,
        "createdBy" character(26),
        "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        "updatedAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_users_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_organizationId" ON "users" ("organizationId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_users_roleId" ON "users" ("roleId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_users_isPasswordChangeRequired" ON "users" ("isPasswordChangeRequired")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_createdBy" ON "users" ("createdBy")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_createdAt" ON "users" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_users_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_createdBy"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_isPasswordChangeRequired"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_roleId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_organizationId"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
  }
}
