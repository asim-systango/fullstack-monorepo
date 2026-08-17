import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedReadLeadsPermission1786386600022 implements MigrationInterface {
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0E1';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'read:leads',
        'Allows a user to read lead details.'
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
