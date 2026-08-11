import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { Role } from '../../common/enums/role.enum';
import { createMediaUploadInterceptor } from '../storage';
import { MediaDto } from './dto/media.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Author, Role.Editor, Role.Admin)
  @UseInterceptors(createMediaUploadInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload media',
    description:
      'Stores the file via StorageService (Cloudinary) and saves metadata in PostgreSQL. ' +
      'Use the returned `id` as `mediaId` in article content blocks.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: {
          type: 'string',
          maxLength: 255,
          description: 'Optional default alt text',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: MediaDto })
  @ApiBadRequestResponse({ description: 'Invalid, unsupported, or too-large file' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Not allowed to upload media' })
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtUser,
    @Body('altText') altText?: string,
  ): Promise<MediaDto> {
    return this.mediaService.upload(file, user, altText);
  }
}
