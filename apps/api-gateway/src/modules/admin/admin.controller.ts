import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { CreateEditorDto } from './dto/create-editor.dto';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiCookieAuth('access_token')
@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List platform users (admin only)' })
  @ApiOkResponse({ description: 'Users and role counts' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  @ApiForbiddenResponse({ description: 'Admin only' })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('editors')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create an Editor (staff) account (admin only)' })
  @ApiCreatedResponse({ description: 'Created editor profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  @ApiForbiddenResponse({ description: 'Admin only' })
  createEditor(@Body() dto: CreateEditorDto) {
    return this.adminService.createEditor(dto);
  }
}
