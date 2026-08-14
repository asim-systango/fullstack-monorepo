import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { ListMembersQueryDto } from './dto/list-members-query.dto';
import { SearchMembersQueryDto } from './dto/search-members-query.dto';
import { SuspendMemberDto } from './dto/suspend-member.dto';
import { MembersService } from './members.service';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List members (admin)' })
  @ApiOkResponse({ description: 'Paginated members with active-loan counts' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  list(@Query() query: ListMembersQueryDto) {
    return this.membersService.list(query);
  }

  @Roles('staff')
  @Get('search')
  @ApiOperation({ summary: 'Desk member search (staff)' })
  @ApiOkResponse({ description: 'Name, id, active-loan count' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  search(@Query() query: SearchMembersQueryDto) {
    return this.membersService.search(query.q);
  }

  @Roles('staff', 'admin')
  @Get(':userId/loan-summary')
  @ApiOperation({ summary: 'Active loan count vs configured limit' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  loanSummary(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.membersService.loanSummary(userId);
  }

  @Roles('admin')
  @Post(':userId/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a member (admin)' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  suspend(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SuspendMemberDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.membersService.suspend(userId, dto.reason, user.id);
  }

  @Roles('admin')
  @Post(':userId/reinstate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reinstate a suspended member (admin)' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  reinstate(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.membersService.reinstate(userId);
  }

  @Roles('staff', 'admin')
  @Get(':userId')
  @ApiOperation({ summary: 'Member library profile' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.membersService.findDetail(userId);
  }
}
