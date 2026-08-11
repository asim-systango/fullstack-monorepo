import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberProfileMirrors1787000000000 implements MigrationInterface {
  name = 'AddMemberProfileMirrors1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);
    await queryRunner.query(
      `ALTER TABLE "member_profile" ADD "email" citext NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_profile" ADD "full_name" character varying(120) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_profile" ALTER COLUMN "email" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_profile" ALTER COLUMN "full_name" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_member_profile_email" ON "member_profile" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_member_profile_full_name" ON "member_profile" ("full_name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_member_profile_full_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_member_profile_email"`);
    await queryRunner.query(`ALTER TABLE "member_profile" DROP COLUMN "full_name"`);
    await queryRunner.query(`ALTER TABLE "member_profile" DROP COLUMN "email"`);
  }
}
