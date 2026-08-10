import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedOnboardingOrganizationRoutePermission1786386600001 implements MigrationInterface {
  private readonly routePermissionId = '01K2P8D3R4S5T6V7W8X9YZA0BD';
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BC';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES (
        '${this.routePermissionId}',
        '/api/v1/organizations/onboard',
        'POST',
        ARRAY['${this.permissionId}']::varchar[]
      )
      ON CONFLICT ("route", "method") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "route_permissions"
      WHERE "id" = '${this.routePermissionId}';
    `);
  }
}
