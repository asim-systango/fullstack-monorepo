import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCreateActivitiesPermission1786386600034 implements MigrationInterface {
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0H1';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'write:activities',
        'Allows a user to create new activities for leads or deals.'
      )
      ON CONFLICT ("name") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE "id" = '${this.permissionId}';
    `);
  }
}
