import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRevisions1720000001002 implements MigrationInterface {
  name = 'CreateRevisions1720000001002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "revisions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "article_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_revisions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_revisions_article_id" FOREIGN KEY ("article_id")
          REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_revisions_article_id" ON "revisions" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_revisions_created_by" ON "revisions" ("created_by")`,
    );

    // Circular FK: Article.publishedRevisionId → Revision.id
    // RESTRICT (not SET NULL): clearing only the FK would break CHK_articles_published_pair.
    await queryRunner.query(`
      ALTER TABLE "articles"
      ADD CONSTRAINT "FK_articles_published_revision_id"
      FOREIGN KEY ("published_revision_id")
      REFERENCES "revisions"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_articles_published_revision_id"`,
    );
    await queryRunner.query(`DROP TABLE "revisions"`);
  }
}
