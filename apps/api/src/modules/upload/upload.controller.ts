import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UploadService } from './upload.service';
import { Public } from '../../common/auth';

@ApiTags('Uploads')
@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('uploads/request-url')
  @ApiOperation({
    summary: 'Request presigned upload URL for medical/document/profile images',
  })
  async requestUploadUrl(
    @Body() body: { name: string; size?: number; contentType?: string },
  ) {
    if (!body.name) {
      throw new BadRequestException('File name is required');
    }
    return this.uploadService.generateUploadUrl(
      body.name,
      body.contentType || 'application/octet-stream',
    );
  }

  @Public()
  @Post('uploads/file/:objectId')
  @ApiOperation({ summary: 'Direct upload endpoint target for binary/image upload' })
  async uploadFile(@Param('objectId') objectId: string, @Req() req: Request) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);
    const objectPath = await this.uploadService.saveUploadedFile(objectId, buffer);
    return { success: true, objectPath };
  }

  @Public()
  @Get('objects/:objectId')
  @ApiOperation({ summary: 'Serve uploaded documents and images' })
  async serveObject(@Param('objectId') objectId: string, @Res() res: Response) {
    const filePath = await this.uploadService.getFilePath(objectId);
    if (!filePath) {
      throw new NotFoundException('Object not found');
    }
    return res.sendFile(filePath);
  }
}
