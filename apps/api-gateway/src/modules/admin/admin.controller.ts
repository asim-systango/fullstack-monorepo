import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth';
import { CreateEditorDto } from './dto/create-editor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Patch('users/:id')
  @ApiOperation({
    summary: 'Update a user profile or activation state (admin only)',
    description:
      'Renames, re-emails, or deactivates a non-admin account. Deactivating keeps ' +
      'the account and its articles but ends its sessions and blocks sign-in. ' +
      'Admin accounts are rejected with 403.',
  })
  @ApiOkResponse({ description: 'Updated user' })
  @ApiBadRequestResponse({ description: 'No updatable field supplied' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid cookie' })
  @ApiForbiddenResponse({ description: 'Admin only, or target is an admin' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email already taken' })
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }
}
