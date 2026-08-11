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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import {
  ListTagsQuery,
  TagIdParam,
  type TagListResponse,
  type TagResponse,
} from './dto/get-tag.dto';
import { TagsService } from './tags.service';

const SWAGGER = {
  unauthorized: 'Missing or invalid JWT',
  forbiddenManage: 'Author (user) cannot manage tags',
  forbiddenRole: 'Insufficient role',
  notFound: 'Tag not found',
  invalidUuid: 'Invalid UUID format',
  nameConflict: 'Tag name already exists',
  inUseConflict: 'Tag is used on a published article',
  tagId: 'Tag UUID',
} as const;

@ApiTags('tags')
@ApiBearerAuth()
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Create a tag',
    description:
      'Editors and Admins only. Name is trimmed and lowercased before persistence. ' +
      'Duplicate normalized names return 409.',
  })
  @ApiCreatedResponse({ description: 'Tag created' })
  @ApiBadRequestResponse({ description: 'Invalid name' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenManage })
  @ApiConflictResponse({ description: SWAGGER.nameConflict })
  createTag(@Body() dto: CreateTagDto): Promise<TagResponse> {
    return this.tagsService.createTag(dto);
  }

  @Get()
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'List tags',
    description:
      'Authenticated studio users. Paginated tags sorted by name ASC for article tagging.',
  })
  @ApiOkResponse({ description: 'Paginated tag list (empty list is valid)' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenRole })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters' })
  listTags(@Query() query: ListTagsQuery): Promise<TagListResponse> {
    return this.tagsService.listTags(query);
  }

  @Get(':id')
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiParam({ name: 'id', description: SWAGGER.tagId, format: 'uuid' })
  @ApiOkResponse({ description: 'Tag detail' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenRole })
  @ApiNotFoundResponse({ description: SWAGGER.notFound })
  @ApiBadRequestResponse({ description: SWAGGER.invalidUuid })
  getTagById(@Param() params: TagIdParam): Promise<TagResponse> {
    return this.tagsService.getTagById(params.id);
  }

  @Patch(':id')
  @Roles(Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Rename a tag',
    description:
      'Editors and Admins only. Name is trimmed and lowercased. ' +
      "Renaming to another tag's normalized name returns 409. " +
      'Tags attached to published articles cannot be renamed (409).',
  })
  @ApiParam({ name: 'id', description: SWAGGER.tagId, format: 'uuid' })
  @ApiOkResponse({ description: 'Tag updated' })
  @ApiBadRequestResponse({ description: 'Invalid name or UUID' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenManage })
  @ApiNotFoundResponse({ description: SWAGGER.notFound })
  @ApiConflictResponse({
    description: `${SWAGGER.nameConflict}, or ${SWAGGER.inUseConflict}`,
  })
  updateTag(
    @Param() params: TagIdParam,
    @Body() dto: UpdateTagDto,
  ): Promise<TagResponse> {
    return this.tagsService.updateTag(params.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Editor, Role.Admin)
  @ApiOperation({
    summary: 'Delete a tag',
    description:
      'Editors and Admins only. Removes ArticleTag links via FK CASCADE. ' +
      'Does not delete Articles or Revisions. ' +
      'Tags attached to published articles cannot be deleted (409).',
  })
  @ApiParam({ name: 'id', description: SWAGGER.tagId, format: 'uuid' })
  @ApiNoContentResponse({ description: 'Tag deleted' })
  @ApiUnauthorizedResponse({ description: SWAGGER.unauthorized })
  @ApiForbiddenResponse({ description: SWAGGER.forbiddenManage })
  @ApiNotFoundResponse({ description: SWAGGER.notFound })
  @ApiBadRequestResponse({ description: SWAGGER.invalidUuid })
  @ApiConflictResponse({ description: SWAGGER.inUseConflict })
  deleteTag(@Param() params: TagIdParam): Promise<void> {
    return this.tagsService.deleteTag(params.id);
  }
}
