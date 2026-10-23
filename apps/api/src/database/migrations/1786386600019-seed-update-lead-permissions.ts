import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateLeadPermissions1786386600019 implements MigrationInterface {
  private readonly updateLeadsPermissionId = '01K5X8D3R4S5T6V7W8X9YZA0D1';
  private readonly updateLeadsStagePermissionId = '01K5X8D3R4S5T6V7W8X9YZA0D2';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES 
        ('${this.updateLeadsPermissionId}', 'update:leads', 'Allows a user to update lead details like title, description, contact, source, or assigned owner.'),
        ('${this.updateLeadsStagePermissionId}', 'update:leads_stage', 'Allows a user to update the stage of a lead.')
      ON CONFLICT ("name") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE "id" IN ('${this.updateLeadsPermissionId}', '${this.updateLeadsStagePermissionId}');
    `);
  }
}
