import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGetOverallKpisRoutePermission1786386600014 implements MigrationInterface {
  private readonly routePermissionId = '01K2P8D3R4S5T6V7W8X9YZA0BL';
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BK';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES (
        '${this.routePermissionId}',
        '/api/v1/dashboard/overall-kpis',
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
