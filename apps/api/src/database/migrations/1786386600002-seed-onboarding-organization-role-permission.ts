import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedOnboardingOrganizationRolePermission1786386600002 implements MigrationInterface {
  private readonly superAdminRoleId = '01J00000000000000000000R01';
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BC';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      VALUES ('${this.superAdminRoleId}', '${this.permissionId}')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "roleId" = '${this.superAdminRoleId}'
        AND "permissionId" = '${this.permissionId}';
    `);
  }
}
