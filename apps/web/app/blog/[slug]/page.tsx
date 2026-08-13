import { SiteHeader } from '@/components/home';
import { ArticleDetailView } from '@/components/article/article-detail';

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogArticlePage({
  params,
}: Readonly<BlogArticlePageProps>) {
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
