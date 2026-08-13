import { SiteHeader } from '@/components/home';
import { ArticleDetailView } from '@/components/article/article-detail';

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoryPage({ params }: Readonly<StoryPageProps>) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <ArticleDetailView slug={slug} />
      </main>
    </div>
  );
}
