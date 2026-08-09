import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticleTags1720000001003 implements MigrationInterface {
  name = 'CreateArticleTags1720000001003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "article_tags" (
        "article_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_article_tags" PRIMARY KEY ("article_id", "tag_id"),
        CONSTRAINT "FK_article_tags_article_id" FOREIGN KEY ("article_id")
          REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_article_tags_tag_id" FOREIGN KEY ("tag_id")
          REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_article_tags_tag_id" ON "article_tags" ("tag_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "article_tags"`);
  }
}
