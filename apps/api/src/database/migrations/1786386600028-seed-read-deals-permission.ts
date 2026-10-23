import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedReadDealsPermission1786386600028 implements MigrationInterface {
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0F3';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'read:deals',
        'Allows a user to read deals.'
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
