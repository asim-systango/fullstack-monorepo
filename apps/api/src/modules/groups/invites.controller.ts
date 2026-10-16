import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../../common/auth';
import type { PublicUser } from '../users';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { GroupsService } from './groups.service';

@ApiTags('invites')
@ApiCookieAuth('access_token')
@Controller('invites')
export class InvitesController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Pending invites for the current user' })
  listMine(@CurrentUser() user: PublicUser) {
    return this.groupsService.listMyInvites(user);
  }

  @Get('preview')
  @Public()
  @ApiOperation({ summary: 'Preview an invite from an email token (public)' })
  preview(@Query('token') token: string) {
    return this.groupsService.previewInvite(token ?? '');
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept an invite via email token' })
  acceptByToken(@Body() dto: AcceptInviteDto, @CurrentUser() user: PublicUser) {
    return this.groupsService.acceptByToken(dto.token, user);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a pending invite in-app' })
  acceptById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.acceptById(id, user);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline a pending invite' })
  declineById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.groupsService.declineById(id, user);
  }
}
