import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/home';
import { ArticleDetailView } from '@/components/article/article-detail';
import { fetchPublicArticleBySlugServer } from '@/lib/api/public-article.server';
import { toArticleMetadata } from '@/lib/seo/article-metadata';

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchPublicArticleBySlugServer(slug);
  if (!article) {
    return { title: 'Article not found' };
  }
  return toArticleMetadata(article);
}

export default async function BlogArticlePage({
  params,
}: Readonly<BlogArticlePageProps>) {
  const { slug } = await params;
  const article = await fetchPublicArticleBySlugServer(slug);
  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <ArticleDetailView article={article} />
      </main>
    </div>
  );
}
