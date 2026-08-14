import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateLeadRoutePermissions1786386600020 implements MigrationInterface {
  private readonly updateLeadRouteId = '01K5X8D3R4S5T6V7W8X9YZA0D3';
  private readonly updateLeadStageRouteId = '01K5X8D3R4S5T6V7W8X9YZA0D4';

  private readonly updateLeadsPermissionId = '01K5X8D3R4S5T6V7W8X9YZA0D1';
  private readonly updateLeadsStagePermissionId = '01K5X8D3R4S5T6V7W8X9YZA0D2';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES 
        (
          '${this.updateLeadRouteId}',
          '/api/v1/leads/:id',
          'PATCH',
          ARRAY['${this.updateLeadsPermissionId}']::varchar[]
        ),
        (
          '${this.updateLeadStageRouteId}',
          '/api/v1/leads/:id/stage',
          'PATCH',
          ARRAY['${this.updateLeadsStagePermissionId}']::varchar[]
        )
      ON CONFLICT ("route", "method") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "route_permissions"
      WHERE "id" IN ('${this.updateLeadRouteId}', '${this.updateLeadStageRouteId}');
    `);
  }
}
