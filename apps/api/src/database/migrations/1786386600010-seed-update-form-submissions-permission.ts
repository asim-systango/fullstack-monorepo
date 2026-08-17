import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateFormSubmissionsPermission1786386600010 implements MigrationInterface {
  private readonly permissionId = '01K2P8D3R4S5T6V7W8X9YZA0BI';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES (
        '${this.permissionId}',
        'update:form-submissions',
        'Allows a user to update form submission status and add review notes.'
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
