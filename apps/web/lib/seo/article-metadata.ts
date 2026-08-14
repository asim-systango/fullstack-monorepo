import type { Metadata } from 'next';
import type { PublicArticleDetail, PublicContentBlock } from '../api/articles';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

function stripMarkdown(value: string): string {
  const withoutLinks = value.replace(/\[([^\]]{1,200})]\([^)]{0,500}\)/g, '$1');
  return withoutLinks
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptFromBlocks(blocks: PublicContentBlock[], maxLength = 160): string {
  for (const block of blocks) {
    if (block.type === 'paragraph') {
      const text = stripMarkdown(block.markdown);
      if (text) return text.slice(0, maxLength);
    }
    if (block.type === 'heading') {
      const text = block.text.trim();
      if (text) return text.slice(0, maxLength);
    }
  }
  return '';
}

export function publicArticlePath(slug: string): string {
  return `/blog/${slug}`;
}

export function toArticleMetadata(article: PublicArticleDetail): Metadata {
  const title = article.metaTitle?.trim() || article.title;
  const description =
    article.metaDescription?.trim() ||
    excerptFromBlocks(article.revision.content) ||
    article.title;
  const image = article.ogImage?.trim() || article.revision.coverMedia?.secureUrl;
  const canonical = publicArticlePath(article.slug);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      type: 'article',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}
