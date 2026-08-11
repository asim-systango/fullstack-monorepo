import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth';
import { MembersService } from '../members/members.service';
import {
  ProvisionMemberProfileDto,
  SyncMemberProfileDto,
} from './dto/member-profile-internal.dto';
import { InternalTokenGuard } from './internal-token.guard';

@ApiTags('internal')
@Public()
@UseGuards(InternalTokenGuard)
@Controller('internal/member-profiles')
export class InternalMemberProfilesController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({
    summary: 'Provision member profile (gateway signup)',
    description: 'Idempotent on userId — returns existing row if already provisioned.',
  })
  provision(@Body() dto: ProvisionMemberProfileDto) {
    return this.membersService.provision({
      userId: dto.userId,
      email: dto.email,
      fullName: dto.fullName,
    });
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get member profile by gateway user id (internal)' })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    const profile = await this.membersService.findByUserId(userId);
    if (!profile) throw new NotFoundException('Member profile not found');
    return profile;
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Sync email/fullName mirrors from gateway' })
  async sync(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SyncMemberProfileDto,
  ) {
    const profile = await this.membersService.syncMirrors(userId, {
      email: dto.email,
      fullName: dto.fullName,
    });
    if (!profile) throw new NotFoundException('Member profile not found');
    return profile;
  }
}
