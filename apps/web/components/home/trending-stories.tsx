'use client';

import { FeaturedStoryCard, GridStoryCard } from './story-cards';
import { toFeedStory } from './feed-story';
import { pageGutter } from './page-gutter';
import { usePublicArticles } from '@/hooks/use-public-articles';

export function TrendingStories() {
  const { data, isLoading, isError } = usePublicArticles({ page: 1, limit: 20 });
  const stories = (data?.data ?? []).map(toFeedStory);
  const featured = stories.slice(0, 2);
  const grid = stories.slice(2, 5);

  return (
    <section id="trending" className={`scroll-mt-20 py-14 md:py-16 ${pageGutter}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl leading-tight text-foreground">Trending</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest published stories from Wordnest.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading stories…</p>
      ) : null}

      {isError ? (
        <p className="mt-8 text-sm text-red-600">
          Could not load stories. Is the API running?
        </p>
      ) : null}

      {!isLoading && !isError && stories.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No published articles yet. Seed some with{' '}
          <code>bash tools/scripts/seed-public-articles.sh</code>.
        </p>
      ) : null}

      {featured.length > 0 ? (
        <div className="mt-8 grid gap-8 border-b border-border pb-10 sm:grid-cols-2 xl:gap-12">
          {featured.map((story) => (
            <FeaturedStoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : null}

      {grid.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {grid.map((story) => (
            <GridStoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
