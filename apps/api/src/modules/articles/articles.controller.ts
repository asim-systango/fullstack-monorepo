import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, type CreatedArticle } from './dto/article.dto';
import {
  ArticleIdParam,
  ListArticlesQuery,
  type ArticleListResponse,
  type ArticleStatsResponse,
  type StudioArticleDetail,
} from './dto/get-article.dto';
import { PublishArticleDto, type PublishedArticle } from './dto/publish-article.dto';
import {
  ArticleSlugParam,
  ListPublicArticlesQuery,
  type PublicArticleDetail,
  type PublicArticleListResponse,
} from './dto/public-article.dto';
import { CreateRevisionDto, type CreatedRevision } from './dto/revision.dto';
import type { SubmittedArticle } from './dto/submit-review.dto';
import { UpdateArticleDto, type DeletedArticle } from './dto/update-article.dto';

const UNAUTHORIZED = 'Missing or invalid JWT';
const FORBIDDEN = 'Insufficient role';
const NOT_FOUND_OWNED = 'Article not found, soft-deleted, or not owned';
const ARTICLE_ID_PARAM = {
  name: 'id',
  description: 'Article UUID',
  format: 'uuid',
} as const;

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Create a draft article with an initial revision',
    description: `
### Content options
Send **exactly one** of:
- \`body\` — plain markdown (converted to one paragraph block), **or**
- \`content\` — ordered blocks (\`paragraph\`, \`heading\`, \`image\`, \`video\`, \`code\`)

### Using media (images / videos)
Swagger \`POST /articles\` is **JSON only** — it does **not** accept file uploads.

1. Call **\`POST /media\`** (multipart) and upload the file.
2. Copy the returned \`id\` (UUID).
3. In \`content\`, add an image/video block with that UUID as \`mediaId\`.

Example image block:
\`\`\`json
{
  "type": "image",
  "mediaId": "<id from POST /media>",
  "alt": "optional",
  "caption": "optional"
}
\`\`\`

The API validates that \`mediaId\` exists, is not soft-deleted, and matches the block type (image vs video). It also writes \`revision_media\` rows. Response content keeps \`mediaId\` only (no nested media object).
`.trim(),
  })
  @ApiCreatedResponse({ description: 'Draft article created' })
  @ApiBadRequestResponse({
    description: 'Invalid input, body/content conflict, tag IDs, or media IDs',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: 'Not allowed to create articles' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  createArticle(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CreatedArticle> {
    return this.articlesService.createArticle(dto, user);
  }

  @Get('public')
  @Public()
  @ApiOperation({
    summary: 'List published articles for the public blog',
    description:
      'No authentication required. Returns only articles with `publishedRevisionId` set ' +
      'and `deletedAt` null. Sorted by `publishedAt DESC`. Draft and soft-deleted articles are never included.',
  })
  @ApiOkResponse({
    description: 'Paginated list of published articles (empty list is valid)',
  })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters' })
  listPublicArticles(
    @Query() query: ListPublicArticlesQuery,
  ): Promise<PublicArticleListResponse> {
    return this.articlesService.listPublicArticles(query);
  }

  @Get('public/:slug')
  @Public()
  @ApiOperation({
    summary: 'Get a published article by slug for the public blog',
    description:
      'No authentication required. Returns the article only when `publishedRevisionId` is set ' +
      'and `deletedAt` is null. Content comes from the published revision pointer — ' +
      'not the latest revision. Draft and soft-deleted slugs return 404.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Article slug (lowercase letters, numbers, hyphens)',
    example: 'understanding-react-hooks',
  })
  @ApiOkResponse({ description: 'Published article detail' })
  @ApiNotFoundResponse({ description: 'Article not found or not published' })
  @ApiBadRequestResponse({ description: 'Invalid slug format' })
  getPublicArticleBySlug(
    @Param() params: ArticleSlugParam,
  ): Promise<PublicArticleDetail> {
    return this.articlesService.getPublicArticleBySlug(params.slug);
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles(Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Platform-wide article counts',
    description:
      'Editors and Admins only. Counts the whole table in a single query so a dashboard ' +
      'never has to sum a paginated list. `total`, `published`, `drafts`, and `pendingReview` ' +
      'exclude soft-deleted articles; `deleted` counts them on their own. ' +
      '`published` and `pendingReview` overlap when a live article has a newer revision under review.',
  })
  @ApiOkResponse({
    description:
      'Body fields: `total`, `published`, `drafts`, `pendingReview`, `deleted`.',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: 'Author (user) cannot read platform stats' })
  getArticleStats(): Promise<ArticleStatsResponse> {
    return this.articlesService.getArticleStats();
  }

  @Get('studio')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'List articles',
    description:
      'Authors see only their own articles. Editors and Admins see every article. ' +
      'Sorted by `updatedAt DESC`. Optional `status`, `q`, and `authorId` narrow the list, ' +
      'and `includeDeleted=true` keeps soft-deleted rows for moderation and trash views. ' +
      '`authorId` is ignored for Authors, who are always scoped to themselves.',
  })
  @ApiOkResponse({ description: 'Paginated article list' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: FORBIDDEN })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters' })
  listArticles(
    @Query() query: ListArticlesQuery,
    @CurrentUser() user: JwtUser,
  ): Promise<ArticleListResponse> {
    return this.articlesService.listArticles(query, user);
  }

  @Get('studio/:id')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Get a single article for studio editing',
    description:
      'Authors can only retrieve their own non-deleted article. ' +
      'Editors and Admins can retrieve any non-deleted article. ' +
      'Returns full revision history with content and resolved media, ordered by createdAt ASC. ' +
      'The published revision is identified by `publishedRevisionId` — ' +
      'do not assume the latest revision is the published one.',
  })
  @ApiParam(ARTICLE_ID_PARAM)
  @ApiOkResponse({ description: 'Article detail with revisions and tags' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: FORBIDDEN })
  @ApiNotFoundResponse({ description: 'Article not found or access denied' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  getStudioArticle(
    @Param() params: ArticleIdParam,
    @CurrentUser() user: JwtUser,
  ): Promise<StudioArticleDetail> {
    return this.articlesService.getStudioArticle(params.id, user);
  }

  @Post(':id/revisions')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Append a new revision to an existing article',
    description:
      'Saving never overwrites an existing revision — each call appends v2, v3, … to the history. ' +
      'This endpoint **never** changes `publishedRevisionId`, so a new revision stays private ' +
      'until an Editor publishes it; an already-published article keeps serving its published revision. ' +
      'Content rules match POST /articles: send exactly one of `body` or `content`. ' +
      'Authors may only add revisions to their own article; Editors and Admins to any article.',
  })
  @ApiParam(ARTICLE_ID_PARAM)
  @ApiCreatedResponse({
    description:
      'Revision created. Body fields: `id`, `articleId`, `content`, `coverMediaId`, ' +
      '`createdBy`, `createdAt`, `revisionNumber`, `publishedRevisionId`.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID, invalid content blocks, or invalid media reference',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: FORBIDDEN })
  @ApiNotFoundResponse({ description: NOT_FOUND_OWNED })
  createRevision(
    @Param() params: ArticleIdParam,
    @Body() dto: CreateRevisionDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CreatedRevision> {
    return this.articlesService.createRevision(params.id, dto, user);
  }

  @Post(':id/submit-review')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Submit the latest revision for editorial review',
    description:
      'Author action. Sets `submittedAt` and points `submittedRevisionId` at the ' +
      'newest revision, so an Editor knows exactly which revision to review. ' +
      '**Does not publish**: `publishedRevisionId` and `publishedAt` are untouched, ' +
      'and only POST /articles/:id/publish (Editor/Admin) can change them. ' +
      'The pointer does not follow later revisions — after creating a newer revision ' +
      'the Author must submit again for the Editor to see it. ' +
      'Authors may only submit their own article.',
  })
  @ApiParam(ARTICLE_ID_PARAM)
  @ApiOkResponse({
    description:
      'Body fields: `id`, `submittedRevisionId`, `submittedAt`, ' +
      '`submittedRevisionNumber`, `publishedRevisionId`.',
  })
  @ApiBadRequestResponse({ description: 'Invalid UUID or article has no revision' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: FORBIDDEN })
  @ApiNotFoundResponse({ description: NOT_FOUND_OWNED })
  submitForReview(
    @Param() params: ArticleIdParam,
    @CurrentUser() user: JwtUser,
  ): Promise<SubmittedArticle> {
    return this.articlesService.submitForReview(params.id, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Update article metadata (title, slug, tags)',
    description:
      'Metadata only — content is versioned, so body changes go through POST /articles/:id/revisions. ' +
      '`tagIds` replaces the whole tag set for the article. ' +
      'At least one field must be provided. Authors may only update their own article.',
  })
  @ApiParam(ARTICLE_ID_PARAM)
  @ApiOkResponse({ description: 'Updated article detail with revisions and tags' })
  @ApiBadRequestResponse({
    description: 'No fields provided, invalid slug format, or invalid tag IDs',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: FORBIDDEN })
  @ApiNotFoundResponse({ description: NOT_FOUND_OWNED })
  @ApiConflictResponse({ description: 'Another article already uses this slug' })
  updateArticle(
    @Param() params: ArticleIdParam,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: JwtUser,
  ): Promise<StudioArticleDetail> {
    return this.articlesService.updateArticle(params.id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Soft delete an article',
    description:
      'Sets `deletedAt`; the row is retained. The article immediately disappears from ' +
      '/articles/public, /articles/public/:slug, and the studio listings. ' +
      'Authors may only delete their own article.',
  })
  @ApiParam(ARTICLE_ID_PARAM)
  @ApiOkResponse({ description: 'Body fields: `id`, `deletedAt`.' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({ description: FORBIDDEN })
  @ApiNotFoundResponse({ description: NOT_FOUND_OWNED })
  deleteArticle(
    @Param() params: ArticleIdParam,
    @CurrentUser() user: JwtUser,
  ): Promise<DeletedArticle> {
    return this.articlesService.deleteArticle(params.id, user);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Publish a specific article revision',
    description:
      'Editors (`staff`) and Admins only. Authors (`user`) receive 403. ' +
      'Sets `publishedRevisionId` and `publishedAt` together on the selected revision. ' +
      'Does not copy revision content onto the article. ' +
      'Republishing a different revision moves the public pointer; older revisions remain as history. ' +
      'Republishing the same revision keeps the pointer and refreshes `publishedAt`.',
  })
  @ApiParam(ARTICLE_ID_PARAM)
  @ApiOkResponse({
    description:
      'Article published (wrapped as `{ data }` by the response envelope). ' +
      'Body fields: `id`, `publishedRevisionId`, `publishedAt`.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID, missing revisionId, or invalid/empty revision content',
  })
  @ApiUnauthorizedResponse({ description: UNAUTHORIZED })
  @ApiForbiddenResponse({
    description: 'Author (user) cannot publish — Editor/Admin only',
  })
  @ApiNotFoundResponse({
    description:
      'Article not found, soft-deleted, or revision not found for this article',
  })
  publishArticle(
    @Param() params: ArticleIdParam,
    @Body() dto: PublishArticleDto,
  ): Promise<PublishedArticle> {
    return this.articlesService.publishArticle(params.id, dto);
  }
}
