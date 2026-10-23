import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGetOrganizationsRoutePermission1786386600004 implements MigrationInterface {
  private readonly routePermissionId = '01K2P8D3R4S5T6V7W8X9YZA0BF';
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BE';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES (
        '${this.routePermissionId}',
        '/api/v1/organizations',
        'GET',
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
