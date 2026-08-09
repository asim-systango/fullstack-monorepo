import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Derived media usage index for a revision.
 * Source of truth: revisions.content + revisions.cover_media_id.
 * Rebuilt by the API on revision save — never client-authored.
 */
export class CreateRevisionMedia1720000001007 implements MigrationInterface {
  name = 'CreateRevisionMedia1720000001007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "revision_media" (
        "revision_id" uuid NOT NULL,
        "media_id" uuid NOT NULL,
        "block_id" text NOT NULL,
        "role" character varying(10) NOT NULL,
        CONSTRAINT "PK_revision_media" PRIMARY KEY ("revision_id", "media_id", "block_id"),
        CONSTRAINT "CHK_revision_media_role" CHECK (
          "role" IN ('cover', 'inline')
        ),
        CONSTRAINT "CHK_revision_media_role_block" CHECK (
          ("role" = 'cover' AND "block_id" = 'cover')
          OR ("role" = 'inline' AND "block_id" <> 'cover')
        ),
        CONSTRAINT "FK_revision_media_revision_id" FOREIGN KEY ("revision_id")
          REFERENCES "revisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_revision_media_media_id" FOREIGN KEY ("media_id")
          REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_revision_media_media_id" ON "revision_media" ("media_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_revision_media_revision_id" ON "revision_media" ("revision_id")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_revision_media_one_cover"
      ON "revision_media" ("revision_id")
      WHERE "role" = 'cover'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "revision_media"`);
  }
}
