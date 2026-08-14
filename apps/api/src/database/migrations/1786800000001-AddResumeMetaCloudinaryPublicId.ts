import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumeMetaCloudinaryPublicId1786800000001 implements MigrationInterface {
  name = 'AddResumeMetaCloudinaryPublicId1786800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resume_metas" ADD "cloudinary_public_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resume_metas" DROP COLUMN "cloudinary_public_id"`,
    );
  }
}
