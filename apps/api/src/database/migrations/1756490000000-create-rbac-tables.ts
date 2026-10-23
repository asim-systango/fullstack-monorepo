import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRbacTables1756490000000 implements MigrationInterface {
  name = 'CreateRbacTables1756490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create permissions table
    await queryRunner.query(
      `CREATE TABLE "permissions" (
        "id" CHAR(26) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
      );`,
    );

    // 2. Create route_permissions table
    await queryRunner.query(
      `CREATE TABLE "route_permissions" (
        "id" CHAR(26) NOT NULL,
        "route" VARCHAR(255) NOT NULL,
        "method" VARCHAR(10) NOT NULL,
        "permissionIds" VARCHAR[] NOT NULL,
        "createdAt" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
        CONSTRAINT "PK_route_permissions_id" PRIMARY KEY ("id")
      );`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_ROUTE_METHOD" ON "route_permissions" ("route", "method");`,
    );

    // 3. Create role_permissions join table
    await queryRunner.query(
      `CREATE TABLE "role_permissions" (
        "roleId" CHAR(26) NOT NULL,
        "permissionId" CHAR(26) NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_UNIQUE_ROUTE_METHOD";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "route_permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions";`);
  }
}
