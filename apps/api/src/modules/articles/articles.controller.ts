import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  ListArticlesQuery,
  type ArticleListResponse,
  type CreatedArticle,
} from './dto/article.dto';

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
}
