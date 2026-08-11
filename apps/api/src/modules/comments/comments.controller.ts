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
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, Public, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import {
  CommentArticleIdParam,
  CommentIdParam,
  ListCommentsQuery,
  type CommentListResponse,
  type CommentResponse,
} from './dto/get-comment.dto';

const SWAGGER = {
  unauthorized: 'Missing or invalid JWT',
  forbiddenRole: 'Insufficient role',
  forbiddenOwner: 'Not the comment owner (and not editor/admin)',
  articleNotFound: 'Article not found, not published, or soft-deleted',
  notFound: 'Comment not found, or its article is unpublished/soft-deleted',
  invalidUuid: 'Invalid UUID format',
  articleId: 'Article UUID',
  commentId: 'Comment UUID',
} as const;

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('articles/:articleId/comments')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Create a comment on a published article',
    description:
      'Authentication required. Comments are allowed only when the article has ' +
      '`publishedRevisionId` set and `deletedAt` is null. Draft, unpublished, ' +
      'soft-deleted, and missing articles return 404. `userId` comes from the JWT — ' +
      'not the request body.',
  })
  @ApiParam({ name: 'articleId', description: SWAGGER.articleId, format: 'uuid' })
  @ApiCreatedResponse({ description: 'Comment created' })
  @ApiBadRequestResponse({ description: 'Invalid or empty body' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenRole })
  @ApiNotFoundResponse({ description: SWAGGER.articleNotFound })
  createComment(
    @Param() params: CommentArticleIdParam,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CommentResponse> {
    return this.commentsService.createComment(params.articleId, dto, user);
  }

  @Get('articles/:articleId/comments')
  @Public()
  @ApiOperation({
    summary: 'List comments for a published article',
    description:
      'No authentication required. Returns comments only when the article is published ' +
      '(`publishedRevisionId IS NOT NULL`) and not soft-deleted. Ordered by `createdAt ASC`. ' +
      'An empty list is a successful response. Draft/deleted articles return 404.',
  })
  @ApiParam({ name: 'articleId', description: SWAGGER.articleId, format: 'uuid' })
  @ApiOkResponse({ description: 'Paginated comment list (empty list is valid)' })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters or UUID' })
  @ApiNotFoundResponse({ description: SWAGGER.articleNotFound })
  listComments(
    @Param() params: CommentArticleIdParam,
    @Query() query: ListCommentsQuery,
  ): Promise<CommentListResponse> {
    return this.commentsService.listComments(params.articleId, query);
  }

  @Get('comments/:id')
  @Public()
  @ApiOperation({
    summary: 'Get a comment by ID',
    description:
      'No authentication required. Returns the comment only when its article is still ' +
      'published and not soft-deleted. Comments on draft/deleted articles are not exposed.',
  })
  @ApiParam({ name: 'id', description: SWAGGER.commentId, format: 'uuid' })
  @ApiOkResponse({ description: 'Comment detail' })
  @ApiNotFoundResponse({ description: SWAGGER.notFound })
  @ApiBadRequestResponse({ description: SWAGGER.invalidUuid })
  getCommentById(@Param() params: CommentIdParam): Promise<CommentResponse> {
    return this.commentsService.getCommentById(params.id);
  }

  @Patch('comments/:id')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Update a comment body',
    description:
      'Owners may update their own comment. Editors and Admins may update any comment ' +
      '(moderation). Only `body` is editable — `userId`, `articleId`, and `createdAt` are immutable. ' +
      'Comments on unpublished or soft-deleted articles return 404.',
  })
  @ApiParam({ name: 'id', description: SWAGGER.commentId, format: 'uuid' })
  @ApiOkResponse({ description: 'Comment updated' })
  @ApiBadRequestResponse({ description: 'Invalid or empty body / UUID' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenOwner })
  @ApiNotFoundResponse({ description: SWAGGER.notFound })
  updateComment(
    @Param() params: CommentIdParam,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CommentResponse> {
    return this.commentsService.updateComment(params.id, dto, user);
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Soft-delete a comment',
    description:
      'Owners may delete their own comment. Editors and Admins may delete any comment ' +
      '(moderation). Soft-deletes via `deletedAt` — does not delete Article, Revision, Tag, or ArticleTag. ' +
      'Comments on unpublished or soft-deleted articles return 404.',
  })
  @ApiParam({ name: 'id', description: SWAGGER.commentId, format: 'uuid' })
  @ApiOkResponse({
    description: 'Comment soft-deleted (not wrapped in data envelope)',
    schema: { example: { message: 'Comment deleted' } },
  })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenOwner })
  @ApiNotFoundResponse({ description: SWAGGER.notFound })
  @ApiBadRequestResponse({ description: SWAGGER.invalidUuid })
  async deleteComment(
    @Param() params: CommentIdParam,
    @CurrentUser() user: JwtUser,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.commentsService.deleteComment(params.id, user);
    // Send raw body — ResponseEnvelopeInterceptor would wrap as { data: { message } }.
    res.status(HttpStatus.OK).json(result);
  }
}
