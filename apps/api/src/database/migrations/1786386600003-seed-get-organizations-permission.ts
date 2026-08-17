import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGetOrganizationsPermission1786386600003 implements MigrationInterface {
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BE';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'read:organization',
        'Allows a user to retrieve paginated organizations list.'
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
