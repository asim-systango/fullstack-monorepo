import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUpdateDealsPermissions1786386600031 implements MigrationInterface {
  private readonly updateDealsId = '01K5X8D3R4S5T6V7W8X9YZA0G1';
  private readonly updateDealsStageId = '01K5X8D3R4S5T6V7W8X9YZA0G2';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "name", "description")
      VALUES 
        ('${this.updateDealsId}', 'update:deals', 'Allows a user to update deal details.'),
        ('${this.updateDealsStageId}', 'update:deals_stage', 'Allows a user to update deal stages.')
      ON CONFLICT ("name") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE "id" IN ('${this.updateDealsId}', '${this.updateDealsStageId}');
    `);
  }
}
