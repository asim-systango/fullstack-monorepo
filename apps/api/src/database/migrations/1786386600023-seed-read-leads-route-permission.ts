import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedReadLeadsRoutePermission1786386600023 implements MigrationInterface {
  private readonly routePermissionId = '01K5X8D3R4S5T6V7W8X9YZA0E2';
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0E1';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES (
        '${this.routePermissionId}',
        '/api/v1/leads/:id',
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
