'use client';

import { GridStoryCard } from './story-cards';
import { toFeedStory } from './feed-story';
import { pageGutter } from './page-gutter';
import { usePublicArticles } from '@/hooks/use-public-articles';

export function MostDiscussed() {
  const { data, isLoading } = usePublicArticles({ page: 1, limit: 20 });
  const stories = (data?.data ?? []).map(toFeedStory).slice(5, 8);

  if (!isLoading && stories.length === 0) return null;

  return (
    <section className="border-t border-border bg-background">
      <div className={`py-14 md:py-16 ${pageGutter}`}>
        <h2 className="font-serif text-2xl leading-tight text-foreground">
          More stories
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep exploring the public feed.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {stories.map((story) => (
              <GridStoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
