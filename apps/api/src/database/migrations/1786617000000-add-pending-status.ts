import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPendingStatus1786617000000 implements MigrationInterface {
  name = 'AddPendingStatus1786617000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."users_status_enum" ADD VALUE IF NOT EXISTS 'PENDING'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Postgres does not support removing values from an ENUM type easily.
    // We will leave the ENUM as is on down.
  }
}
