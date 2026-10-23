import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateLeadRolePermissions1786386600021 implements MigrationInterface {
  private readonly superAdminRoleId = '01J00000000000000000000R01';
  private readonly orgAdminRoleId = '01J00000000000000000000R02';
  private readonly salesLeadRoleId = '01J00000000000000000000R03';
  private readonly salesRepRoleId = '01J00000000000000000000R04';

  private readonly updateLeadsPermissionId = '01K5X8D3R4S5T6V7W8X9YZA0D1';
  private readonly updateLeadsStagePermissionId = '01K5X8D3R4S5T6V7W8X9YZA0D2';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      VALUES 
        -- update:leads (Details update)
        ('${this.superAdminRoleId}', '${this.updateLeadsPermissionId}'),
        ('${this.orgAdminRoleId}', '${this.updateLeadsPermissionId}'),
        ('${this.salesLeadRoleId}', '${this.updateLeadsPermissionId}'),

        -- update:leads_stage (Stage update)
        ('${this.superAdminRoleId}', '${this.updateLeadsStagePermissionId}'),
        ('${this.orgAdminRoleId}', '${this.updateLeadsStagePermissionId}'),
        ('${this.salesLeadRoleId}', '${this.updateLeadsStagePermissionId}'),
        ('${this.salesRepRoleId}', '${this.updateLeadsStagePermissionId}')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permissionId" IN ('${this.updateLeadsPermissionId}', '${this.updateLeadsStagePermissionId}');
    `);
  }
}
