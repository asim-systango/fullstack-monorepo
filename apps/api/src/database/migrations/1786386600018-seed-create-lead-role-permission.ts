import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCreateLeadRolePermission1786386600018 implements MigrationInterface {
  private readonly orgAdminRoleId = '01J00000000000000000000R02';
  private readonly salesLeadRoleId = '01J00000000000000000000R03';
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0C1';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      VALUES 
        ('${this.orgAdminRoleId}', '${this.permissionId}'),
        ('${this.salesLeadRoleId}', '${this.permissionId}')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "roleId" IN ('${this.orgAdminRoleId}', '${this.salesLeadRoleId}')
        AND "permissionId" = '${this.permissionId}';
    `);
  }
}
