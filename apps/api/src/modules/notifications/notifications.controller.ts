import { Controller, Get, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '@shared/http';
import { JwtUser } from '../../common/auth';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('user', 'staff', 'admin')
  @ApiOperation({ summary: 'Get recent notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(@CurrentUser() user: JwtUser) {
    const notifications = await this.notificationsService.findByUser(user.id);
    return { data: notifications };
  }

  @Patch(':id/read')
  @Roles('user', 'staff', 'admin')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    const updated = await this.notificationsService.markAsRead(id, user.id);
    return { data: updated };
  }
}
