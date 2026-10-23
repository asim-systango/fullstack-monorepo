import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCreateDealPermission1786386600025 implements MigrationInterface {
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0F1';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'write:deals',
        'Allows a user to create new deals and convert leads.'
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
