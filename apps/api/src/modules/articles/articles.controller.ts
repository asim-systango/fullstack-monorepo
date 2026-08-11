import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  type StudioArticleDetail,
} from './dto/get-article.dto';
import {
  ListPublicArticlesQuery,
  type PublicArticleListResponse,
} from './dto/public-article.dto';

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
    description:
      'Send either `body` (markdown string) or `content` (ordered blocks: paragraph, heading, image, video, code) — not both. For image/video blocks, upload media first and pass mediaId.',
  })
  @ApiCreatedResponse({ description: 'Draft article created' })
  @ApiBadRequestResponse({
    description: 'Invalid input, body/content conflict, tag IDs, or media IDs',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
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

  @Get('studio')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'List articles',
    description:
      'Authors see only their own non-deleted articles. Editors and Admins see all non-deleted articles. ' +
      'Sorted by `updatedAt DESC`. Soft-deleted articles are always excluded.',
  })
  @ApiOkResponse({ description: 'Paginated article list' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
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
      'Returns full revision history (metadata only, ordered by createdAt ASC). ' +
      'The published revision is identified by `publishedRevisionId` — ' +
      'do not assume the latest revision is the published one.',
  })
  @ApiParam({ name: 'id', description: 'Article UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Article detail with revisions and tags' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  @ApiNotFoundResponse({ description: 'Article not found or access denied' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  getStudioArticle(
    @Param() params: ArticleIdParam,
    @CurrentUser() user: JwtUser,
  ): Promise<StudioArticleDetail> {
    return this.articlesService.getStudioArticle(params.id, user);
  }
}
