import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGetFormSubmissionsPermission1786386600007 implements MigrationInterface {
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BG';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'read:form-submissions',
        'Allows a user to retrieve paginated form submissions list.'
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
