import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/components/ui';
import type { FeedStory } from './feed-story';

function AuthorMeta({ story }: Readonly<{ story: FeedStory }>) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        aria-hidden
        className="inline-flex size-5 items-center justify-center rounded-full bg-surface-subtle text-[0.625rem] font-medium text-foreground"
      >
        {story.authorInitials}
      </span>
      <span className="text-foreground">{story.author}</span>
      <span aria-hidden>·</span>
      <time>{story.publishedAt}</time>
    </div>
  );
}

function StoryThumb({
  story,
  className,
}: Readonly<{
  story: FeedStory;
  className?: string;
}>) {
  if (!story.coverUrl) {
    return (
      <div
        aria-hidden
        className={cn('overflow-hidden rounded-md bg-surface-muted', className)}
      />
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-surface-muted', className)}
    >
      <Image
        src={story.coverUrl}
        alt={story.imageAlt ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
    </div>
  );
}

export function FeaturedStoryCard({ story }: Readonly<{ story: FeedStory }>) {
  return (
    <article className="flex h-full flex-col">
      <AuthorMeta story={story} />
      <Link
        href={`/stories/${story.slug}`}
        className="mt-3 no-underline hover:no-underline"
      >
        {story.coverUrl ? (
          <StoryThumb story={story} className="mb-4 aspect-[16/9] w-full" />
        ) : null}
        <h3 className="font-sans text-xl leading-snug font-bold tracking-tight text-foreground md:text-2xl">
          {story.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {story.excerpt}
        </p>
      </Link>
    </article>
  );
}

export function GridStoryCard({ story }: Readonly<{ story: FeedStory }>) {
  return (
    <article className="flex h-full flex-col">
      {story.coverUrl ? (
        <Link href={`/stories/${story.slug}`} className="mb-4 block no-underline">
          <StoryThumb story={story} className="aspect-[16/10] w-full" />
        </Link>
      ) : null}
      <AuthorMeta story={story} />
      <Link
        href={`/stories/${story.slug}`}
        className="mt-2.5 no-underline hover:no-underline"
      >
        <h3 className="font-sans text-lg leading-snug font-bold tracking-tight text-foreground">
          {story.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {story.excerpt}
        </p>
      </Link>
    </article>
  );
}

export function LatestStoryCard({ story }: Readonly<{ story: FeedStory }>) {
  return (
    <article className="border-b border-border py-8 first:pt-0 last:border-b-0">
      <AuthorMeta story={story} />
      <div className="mt-3 flex gap-5 sm:gap-8">
        <div className="min-w-0 flex-1">
          <Link
            href={`/stories/${story.slug}`}
            className="no-underline hover:no-underline"
          >
            <h3 className="font-sans text-xl leading-snug font-bold tracking-tight text-foreground md:text-[1.35rem]">
              {story.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:line-clamp-3">
              {story.excerpt}
            </p>
          </Link>
        </div>

        {story.coverUrl ? (
          <Link href={`/stories/${story.slug}`} className="block shrink-0 no-underline">
            <StoryThumb
              story={story}
              className="size-20 rounded-sm sm:h-[108px] sm:w-[160px]"
            />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
