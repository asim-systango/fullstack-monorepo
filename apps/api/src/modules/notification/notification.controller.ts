import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser, JwtUser, Roles } from '../../common/auth';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'List of user notifications' })
  async findAll(@CurrentUser() user: JwtUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.notificationService.findAllForUser(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked read' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.notificationService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked read' })
  async markAllAsRead(@CurrentUser() user: JwtUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.notificationService.markAllAsRead(user.id);
  }

  @Post('send-reminder')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Send automated SMS consultation reminder to patient' })
  @ApiResponse({
    status: 201,
    description: 'Reminder notification dispatched successfully',
  })
  async sendReminder(@Body() body: { appointmentId: string; userId: string }) {
    return this.notificationService.sendReminder(body.appointmentId, body.userId);
  }
}
