import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateDealsRoutePermissions1786386600032 implements MigrationInterface {
  private readonly routeDealsId = '01K5X8D3R4S5T6V7W8X9YZA0G3';
  private readonly routeDealsStageId = '01K5X8D3R4S5T6V7W8X9YZA0G4';

  private readonly updateDealsId = '01K5X8D3R4S5T6V7W8X9YZA0G1';
  private readonly updateDealsStageId = '01K5X8D3R4S5T6V7W8X9YZA0G2';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "route_permissions"
        ("id", "route", "method", "permissionIds")
      VALUES 
        ('${this.routeDealsId}', '/api/v1/deals/:id', 'PATCH', ARRAY['${this.updateDealsId}']::varchar[]),
        ('${this.routeDealsStageId}', '/api/v1/deals/:id/stage', 'PATCH', ARRAY['${this.updateDealsStageId}']::varchar[])
      ON CONFLICT ("route", "method") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "route_permissions"
      WHERE "id" IN ('${this.routeDealsId}', '${this.routeDealsStageId}');
    `);
  }
}
