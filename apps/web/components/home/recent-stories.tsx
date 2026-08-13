'use client';

import { LatestStoryCard } from './story-cards';
import { toFeedStory } from './feed-story';
import { pageGutter } from './page-gutter';
import { usePublicArticles } from '@/hooks/use-public-articles';

export function RecentStories() {
  const { data, isLoading } = usePublicArticles({ page: 1, limit: 20 });
  const stories = (data?.data ?? []).map(toFeedStory).slice(0, 6);

  if (!isLoading && stories.length === 0) return null;

  return (
    <section className="border-t border-border bg-background">
      <div
        className={`grid gap-8 py-12 md:grid-cols-[240px_minmax(0,1fr)] md:gap-12 md:py-16 lg:grid-cols-[280px_minmax(0,1fr)] ${pageGutter}`}
      >
        <div className="md:sticky md:top-24 md:self-start">
          <h2 className="font-serif text-2xl leading-tight text-foreground">
            Recently published
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Fresh from the public API.</p>
        </div>
        <div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            stories.map((story) => <LatestStoryCard key={story.id} story={story} />)
          )}
        </div>
      </div>
    </section>
  );
}
