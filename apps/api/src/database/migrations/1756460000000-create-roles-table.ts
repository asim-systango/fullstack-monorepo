import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1756460000000 implements MigrationInterface {
  name = 'CreateRolesTable1756460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" (
        "id" character(26) NOT NULL,
        "name" character varying(50) NOT NULL,
        "description" text,
        "createdAt" bigint NOT NULL DEFAULT (EXTRACT(epoch FROM now()) * 1000),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_roles_name" ON "roles" ("name")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_roles_name"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
