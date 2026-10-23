import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedReadDealsRoutePermission1786386600029 implements MigrationInterface {
  private readonly routePermissionId = '01K5X8D3R4S5T6V7W8X9YZA0F4';
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0F3';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES (
        '${this.routePermissionId}',
        '/api/v1/deals',
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
