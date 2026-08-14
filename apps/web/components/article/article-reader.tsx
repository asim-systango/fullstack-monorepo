import Image from 'next/image';
import type { ReactNode } from 'react';
import type { ArticleMedia, PublicContentBlock } from '@/lib/api/articles';
import { ArticleContent } from './article-content';

type CoverImage = {
  secureUrl: string;
  defaultAltText: string | null;
};

type ArticleReaderProps = {
  title: string;
  blocks: PublicContentBlock[];
  media?: ArticleMedia[];
  cover?: CoverImage | null;
  tags?: Array<{ id: string; name: string }>;
  /** Byline / dates / revision label — differs between draft preview and public. */
  meta?: ReactNode;
  priorityCover?: boolean;
};

/**
 * The reading experience shared by the public article page, the author's draft
 * preview, and the editor's review screen, so a draft looks exactly like it will
 * once published.
 */
export function ArticleReader({
  title,
  blocks,
  media = [],
  cover,
  tags = [],
  meta,
  priorityCover = false,
}: Readonly<ArticleReaderProps>) {
  return (
    <article>
      <header className="mx-auto max-w-content-wide">
        {tags.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {tags.map((tag) => tag.name).join(' · ')}
          </p>
        ) : null}

        <h1 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>

        {meta ? <div className="mt-4 text-sm text-muted-foreground">{meta}</div> : null}
      </header>

      {cover ? (
        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-content-wide overflow-hidden rounded-lg bg-surface-muted md:aspect-[2/1]">
          <Image
            src={cover.secureUrl}
            alt={cover.defaultAltText ?? title}
            fill
            priority={priorityCover}
            sizes="(max-width: 1192px) 100vw, 960px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-12">
        <ArticleContent blocks={blocks} media={media} />
      </div>
    </article>
  );
}
