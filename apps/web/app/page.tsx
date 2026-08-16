import {
  HomeHero,
  MostDiscussed,
  RecentStories,
  SiteHeader,
  TrendingStories,
} from '@/components/home';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HomeHero />
        <TrendingStories />
        <MostDiscussed />
        <RecentStories />
      </main>
    </div>
  );
}
