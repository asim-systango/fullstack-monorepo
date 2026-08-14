'use client';

import Link from 'next/link';
import { formatLongDate } from '@/lib/format/date';
import type { PublicArticleDetail } from '@/lib/api/articles';
import { pageGutter } from '@/components/home/page-gutter';
import { ArticleReader } from './article-reader';
import { CommentSection } from './comment-section';

export function ArticleDetailView({
  article,
}: Readonly<{ article: PublicArticleDetail }>) {
  return (
    <div className="pb-20">
      <div className={`${pageGutter} pt-8`}>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground no-underline hover:text-foreground hover:underline"
        >
          ← Back to Blog
        </Link>
      </div>

      <div className={`${pageGutter} mt-8`}>
        <ArticleReader
          title={article.title}
          blocks={article.revision.content}
          media={article.revision.media}
          cover={article.revision.coverMedia}
          tags={article.tags}
          priorityCover
          meta={<span>Published {formatLongDate(article.publishedAt)}</span>}
        />

        <CommentSection articleId={article.id} />
      </div>
    </div>
  );
}
