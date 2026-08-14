import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateDealsRolePermissions1786386600033 implements MigrationInterface {
  private readonly superAdminRoleId = '01J00000000000000000000R01';
  private readonly orgAdminRoleId = '01J00000000000000000000R02';
  private readonly salesLeadRoleId = '01J00000000000000000000R03';
  private readonly salesRepRoleId = '01J00000000000000000000R04';

  private readonly updateDealsId = '01K5X8D3R4S5T6V7W8X9YZA0G1';
  private readonly updateDealsStageId = '01K5X8D3R4S5T6V7W8X9YZA0G2';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // update:deals -> SUPER_ADMIN, ORG_ADMIN, SALES_LEAD
    // update:deals_stage -> SUPER_ADMIN, ORG_ADMIN, SALES_LEAD, SALES_REP

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      VALUES 
        ('${this.superAdminRoleId}', '${this.updateDealsId}'),
        ('${this.orgAdminRoleId}', '${this.updateDealsId}'),
        ('${this.salesLeadRoleId}', '${this.updateDealsId}'),
        
        ('${this.superAdminRoleId}', '${this.updateDealsStageId}'),
        ('${this.orgAdminRoleId}', '${this.updateDealsStageId}'),
        ('${this.salesLeadRoleId}', '${this.updateDealsStageId}'),
        ('${this.salesRepRoleId}', '${this.updateDealsStageId}')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permissionId" IN ('${this.updateDealsId}', '${this.updateDealsStageId}');
    `);
  }
}
