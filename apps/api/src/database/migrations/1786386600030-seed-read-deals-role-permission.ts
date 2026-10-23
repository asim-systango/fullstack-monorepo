import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedReadDealsRolePermission1786386600030 implements MigrationInterface {
  private readonly superAdminRoleId = '01J00000000000000000000R01';
  private readonly orgAdminRoleId = '01J00000000000000000000R02';
  private readonly salesLeadRoleId = '01J00000000000000000000R03';
  private readonly salesRepRoleId = '01J00000000000000000000R04';

  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0F3';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      VALUES 
        ('${this.superAdminRoleId}', '${this.permissionId}'),
        ('${this.orgAdminRoleId}', '${this.permissionId}'),
        ('${this.salesLeadRoleId}', '${this.permissionId}'),
        ('${this.salesRepRoleId}', '${this.permissionId}')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permissionId" = '${this.permissionId}';
    `);
  }
}
