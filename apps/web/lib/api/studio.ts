import { apiClient } from './api-client';
import type { ArticleMedia } from './articles';

export type ArticleTag = { id: string; name: string };

export type StudioArticleListItem = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: string | null;
  submittedRevisionId: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Only ever non-null when the list was fetched with `includeDeleted`. */
  deletedAt: string | null;
  revisionCount: number;
  latestRevisionId: string | null;
  /** 1-based position of the submitted/published revision in the history. */
  submittedRevisionNumber: number | null;
  publishedRevisionNumber: number | null;
  tags: ArticleTag[];
};

export type StudioArticleListResponse = {
  data: StudioArticleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StudioRevision = {
  id: string;
  createdBy: string;
  coverMediaId: string | null;
  content: unknown[];
  createdAt: string;
  /** Resolved assets for the `mediaId` on inline blocks. */
  media: ArticleMedia[];
};

export type StudioArticleDetail = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: string | null;
  publishedAt: string | null;
  submittedRevisionId: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ArticleTag[];
  revisions: StudioRevision[];
};

/** Ordered blocks accepted by `POST /articles`. Media blocks reference `POST /media` ids. */
export type ArticleContentBlock =
  | { type: 'paragraph'; markdown: string }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'image'; mediaId: string; alt?: string; caption?: string }
  | { type: 'video'; mediaId: string; caption?: string }
  | { type: 'code'; code: string; language?: string };

/** The API accepts either `body` or `content`, never both. */
export type CreateArticleInput = {
  title: string;
  slug: string;
  body?: string;
  content?: ArticleContentBlock[];
  tagIds?: string[];
  coverMediaId?: string;
};

export type CreatedArticle = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  publishedRevisionId: null;
  publishedAt: null;
  createdAt: string;
  updatedAt: string;
  revision: { id: string; content: unknown[]; createdAt: string };
  tags: Array<{ id: string; name: string }>;
};

export type PublishedArticle = {
  id: string;
  publishedRevisionId: string;
  publishedAt: string;
};

/** Body for `POST /articles/:id/revisions`. Same content rules as create. */
export type CreateRevisionInput = {
  body?: string;
  content?: ArticleContentBlock[];
  coverMediaId?: string;
};

export type CreatedRevision = {
  id: string;
  articleId: string;
  content: unknown[];
  coverMediaId: string | null;
  createdBy: string;
  createdAt: string;
  revisionNumber: number;
  /** Untouched by the save — a new revision is never published automatically. */
  publishedRevisionId: string | null;
};

/** Body for `PATCH /articles/:id`. Metadata only; content goes through revisions. */
export type UpdateArticleInput = {
  title?: string;
  slug?: string;
  tagIds?: string[];
};

export type DeletedArticle = {
  id: string;
  deletedAt: string;
};

export type SubmittedArticle = {
  id: string;
  submittedRevisionId: string;
  submittedAt: string;
  submittedRevisionNumber: number;
  /** Echoed back unchanged — submitting for review never publishes. */
  publishedRevisionId: string | null;
};

/**
 * Server-side narrowing for the article list. Filtering here rather than in the
 * browser keeps counts and pages correct once there are more articles than fit
 * on one page.
 */
export type StudioArticleFilters = {
  page?: number;
  limit?: number;
  /** `review` overlaps `published` when a live article has a newer submission. */
  status?: 'draft' | 'review' | 'published';
  /** Case-insensitive partial title match. */
  q?: string;
  authorId?: string;
  /** Editors and admins only in practice; authors stay scoped to their own rows. */
  includeDeleted?: boolean;
};

/** Dataset-wide counts from `GET /articles/stats` — never summed from a page. */
export type ArticleStats = {
  total: number;
  published: number;
  drafts: number;
  pendingReview: number;
  deleted: number;
};

export async function fetchStudioArticles(
  params?: StudioArticleFilters,
): Promise<StudioArticleListResponse> {
  const { data } = await apiClient.get<StudioArticleListResponse>('/articles/studio', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.q ? { q: params.q } : {}),
      ...(params?.authorId ? { authorId: params.authorId } : {}),
      ...(params?.includeDeleted ? { includeDeleted: true } : {}),
    },
  });
  return data;
}

/** Editors and admins only — authors receive 403. */
export async function fetchArticleStats(): Promise<ArticleStats> {
  const { data } = await apiClient.get<ArticleStats>('/articles/stats');
  return data;
}

export async function fetchStudioArticle(id: string): Promise<StudioArticleDetail> {
  const { data } = await apiClient.get<StudioArticleDetail>(`/articles/studio/${id}`);
  return data;
}

export async function createArticle(input: CreateArticleInput): Promise<CreatedArticle> {
  const { data } = await apiClient.post<CreatedArticle>('/articles', input);
  return data;
}

export async function publishArticle(
  articleId: string,
  revisionId: string,
): Promise<PublishedArticle> {
  const { data } = await apiClient.post<PublishedArticle>(
    `/articles/${articleId}/publish`,
    {
      revisionId,
    },
  );
  return data;
}

/** Appends a revision. Never changes what the public blog serves. */
export async function createRevision(
  articleId: string,
  input: CreateRevisionInput,
): Promise<CreatedRevision> {
  const { data } = await apiClient.post<CreatedRevision>(
    `/articles/${articleId}/revisions`,
    input,
  );
  return data;
}

export async function updateArticle(
  articleId: string,
  input: UpdateArticleInput,
): Promise<StudioArticleDetail> {
  const { data } = await apiClient.patch<StudioArticleDetail>(
    `/articles/${articleId}`,
    input,
  );
  return data;
}

/**
 * Author action: asks an editor to review the newest revision.
 * Publishing stays an editor-only action on a separate endpoint.
 */
export async function submitArticleForReview(
  articleId: string,
): Promise<SubmittedArticle> {
  const { data } = await apiClient.post<SubmittedArticle>(
    `/articles/${articleId}/submit-review`,
  );
  return data;
}

export async function deleteArticle(articleId: string): Promise<DeletedArticle> {
  const { data } = await apiClient.delete<DeletedArticle>(`/articles/${articleId}`);
  return data;
}

/** Publication is derived from the pointer, never from a status string. */
export function isPublished(
  article: Pick<StudioArticleListItem, 'publishedRevisionId'>,
): boolean {
  return article.publishedRevisionId !== null;
}

/** Soft-deleted: retained in the table but gone from every public surface. */
export function isDeleted(article: Pick<StudioArticleListItem, 'deletedAt'>): boolean {
  return article.deletedAt !== null;
}

export function getLatestRevision(
  article: StudioArticleDetail,
): StudioRevision | undefined {
  return article.revisions.at(-1);
}

export function getRevisionLabel(index: number): string {
  return `v${index + 1}`;
}

/** Pointers that together describe where an article sits in the workflow. */
export type ReviewPointers = Pick<
  StudioArticleListItem,
  'publishedRevisionId' | 'submittedRevisionId' | 'latestRevisionId'
>;

/** The list endpoint sends `latestRevisionId`; the detail endpoint sends the history. */
export function toReviewPointers(article: StudioArticleDetail): ReviewPointers {
  return {
    publishedRevisionId: article.publishedRevisionId,
    submittedRevisionId: article.submittedRevisionId,
    latestRevisionId: article.revisions.at(-1)?.id ?? null,
  };
}

/**
 * The workflow position of an article, derived purely from the three revision
 * pointers. There is no status column — publication is `publishedRevisionId`
 * and review is `submittedRevisionId`, and the two never imply each other.
 */
export type ArticleReviewState =
  /** Never submitted, never published. */
  | 'draft'
  /** The newest revision is with an editor. */
  | 'pending-review'
  /** Submitted, but the author has written a newer revision since. */
  | 'changes-after-submit'
  /** Live, and the newest revision is the live one. */
  | 'published'
  /** Live, with a newer revision submitted for review. */
  | 'published-pending-review'
  /** Live, with a newer revision the author has not submitted yet. */
  | 'published-with-draft';

export function getReviewState(article: ReviewPointers): ArticleReviewState {
  const { publishedRevisionId, submittedRevisionId, latestRevisionId } = article;
  const latestIsSubmitted =
    submittedRevisionId !== null && submittedRevisionId === latestRevisionId;

  if (publishedRevisionId === null) {
    if (submittedRevisionId === null) return 'draft';
    return latestIsSubmitted ? 'pending-review' : 'changes-after-submit';
  }
  if (publishedRevisionId === latestRevisionId) return 'published';
  return latestIsSubmitted ? 'published-pending-review' : 'published-with-draft';
}

/**
 * The editor review queue: an author has submitted a revision that is not
 * already the live one. Drafts that were never submitted stay out of the queue.
 */
export function isAwaitingReview(article: ReviewPointers): boolean {
  return (
    article.submittedRevisionId !== null &&
    article.submittedRevisionId !== article.publishedRevisionId
  );
}

/** True once the author has submitted, regardless of what happened after. */
export function isSubmittedForReview(
  article: Pick<StudioArticleListItem, 'submittedRevisionId'>,
): boolean {
  return article.submittedRevisionId !== null;
}

/** Which revision the public blog is currently serving, if any. */
export function getPublishedRevisionIndex(article: StudioArticleDetail): number {
  return article.revisions.findIndex((r) => r.id === article.publishedRevisionId);
}

/** Which revision the author asked an editor to review, if any. */
export function getSubmittedRevisionIndex(article: StudioArticleDetail): number {
  return article.revisions.findIndex((r) => r.id === article.submittedRevisionId);
}

/** True when the newest revision is not the one that is live. */
export function hasUnpublishedChanges(article: StudioArticleDetail): boolean {
  if (article.publishedRevisionId === null) return false;
  return article.revisions.at(-1)?.id !== article.publishedRevisionId;
}
