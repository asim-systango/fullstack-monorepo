import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { CloudinarySignatureQueryDto } from './dto/cloudinary-signature-query.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiBearerAuth()
  @Roles('staff', 'admin')
  @Get('cloudinary-signature')
  @ApiOperation({
    summary: 'Signed upload params for Cloudinary (staff/admin)',
  })
  @ApiOkResponse({
    description: 'Cloudinary signed upload payload inside `{ data }`',
  })
  getCloudinarySignature(@Query() query: CloudinarySignatureQueryDto) {
    return this.uploadsService.createCloudinarySignature(query.folder);
  }
}
