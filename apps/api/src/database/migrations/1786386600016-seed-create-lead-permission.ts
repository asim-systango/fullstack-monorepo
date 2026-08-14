import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCreateLeadPermission1786386600016 implements MigrationInterface {
  private readonly permissionId = '01K5X8D3R4S5T6V7W8X9YZA0C1';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'write:leads',
        'Allows a user to create new leads and assign them.'
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
