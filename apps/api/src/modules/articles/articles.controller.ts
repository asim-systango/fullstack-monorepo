import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, type CreatedArticle } from './dto/article.dto';

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
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Not allowed to create articles' })
  @ApiConflictResponse({ description: 'Slug already exists' })
  createArticle(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CreatedArticle> {
    return this.articlesService.createArticle(dto, user);
  }
}
