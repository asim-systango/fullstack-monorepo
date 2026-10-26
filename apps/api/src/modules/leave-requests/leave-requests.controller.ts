import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ApproveLeaveRequestDto, RejectLeaveRequestDto } from './dto/decision.dto';
import {
  AwayQueryDto,
  ListLeaveRequestsQueryDto,
  MyLeaveRequestsQueryDto,
  QuoteQueryDto,
} from './dto/leave-request-queries.dto';
import { LeaveRequestsService } from './leave-requests.service';

@ApiTags('leave-requests')
@ApiBearerAuth()
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequests: LeaveRequestsService) {}

  // fixed paths first, otherwise ':id' would catch "me", "quote" and "away"
  @Get('me')
  @Roles('user', 'staff')
  @ApiOperation({
    summary: 'My requests (paginated, filters: status, leaveTypeId, from, to)',
  })
  listMine(@CurrentUser() user: JwtUser, @Query() query: MyLeaveRequestsQueryDto) {
    return this.leaveRequests.listMine(user, query);
  }

  @Get('quote')
  @Roles('user', 'staff')
  @ApiOperation({ summary: 'Working days between two dates (preview before applying)' })
  quote(@Query() query: QuoteQueryDto) {
    return this.leaveRequests.quote(query);
  }

  @Get('away')
  @Roles('staff', 'admin')
  @ApiOperation({ summary: "Who's away: approved leave for the next 14 days, by date" })
  away(@Query() query: AwayQueryDto) {
    return this.leaveRequests.away(query);
  }

  @Get()
  @Roles('staff', 'admin')
  @ApiOperation({
    summary: 'All requests (paginated, filters: status, leaveTypeId, from, to, userId)',
  })
  listAll(@CurrentUser() user: JwtUser, @Query() query: ListLeaveRequestsQueryDto) {
    return this.leaveRequests.listAll(user, query);
  }

  @Get(':id')
  @Roles('user', 'staff', 'admin')
  @ApiOperation({ summary: 'One request (employees only see their own)' })
  findOne(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.leaveRequests.findOne(user, id);
  }

  @Post()
  @Roles('user', 'staff')
  @ApiOperation({ summary: 'Apply for leave (409 overlap, 400 not enough days)' })
  apply(@CurrentUser() user: JwtUser, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequests.apply(user, dto);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @Roles('staff', 'admin')
  @ApiOperation({ summary: 'Approve: status + balance in one transaction' })
  approve(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveLeaveRequestDto,
  ) {
    return this.leaveRequests.approve(user, id, dto);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @Roles('staff', 'admin')
  @ApiOperation({ summary: 'Reject with a comment' })
  reject(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectLeaveRequestDto,
  ) {
    return this.leaveRequests.reject(user, id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @Roles('user', 'staff')
  @ApiOperation({ summary: 'Cancel my own pending request' })
  cancel(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.leaveRequests.cancel(user, id);
  }

  @Delete(':id')
  @Roles('user', 'staff', 'admin')
  @ApiOperation({
    summary:
      'Soft delete a cancelled request (owner) or a cancelled/rejected one (admin)',
  })
  remove(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.leaveRequests.remove(user, id);
  }
}
