import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectSoftDeleteAndMemberSnapshots1730000000001 implements MigrationInterface {
  name = 'ProjectSoftDeleteAndMemberSnapshots1730000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD COLUMN "deleted_at" TIMESTAMPTZ
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_projects_deleted_at" ON "projects" ("deleted_at")
    `);
    await queryRunner.query(`
      ALTER TABLE "project_members"
      ADD COLUMN "name" character varying(120),
      ADD COLUMN "email" character varying(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "project_members"
      DROP COLUMN "email",
      DROP COLUMN "name"
    `);
    await queryRunner.query(`DROP INDEX "IDX_projects_deleted_at"`);
    await queryRunner.query(`
      ALTER TABLE "projects"
      DROP COLUMN "deleted_at"
    `);
  }
}
