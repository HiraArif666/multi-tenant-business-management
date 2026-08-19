import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { NotificationService } from './notification.service';
import { BadRequestException } from '@nestjs/common';
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: any) {
    const user = req.user;
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    const unreadCount = await this.notificationService.getUnreadCount(
      businessUnitId,
      user.id,
    );

    return {
      success: true,
      data: { unreadCount },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated notifications' })
  async getNotifications(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const user = req.user;
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    const result = await this.notificationService.getNotifications(
      businessUnitId,
      user.id,
      Number(page),
      Number(limit),
    );

    return {
      success: true,
      ...result,
    };
  }

 @Patch('mark-all/read')
@ApiOperation({ summary: 'Mark all notifications as read' })
async markAllAsRead(@Req() req: any) {
  const user = req.user;

  const businessUnitId =
    user.role === 'superadmin'
      ? user.selectedBusinessUnitId
      : user.businessUnitId;

  const result = await this.notificationService.markAllAsRead(
    businessUnitId,
    user.id,
  );

  return {
    success: true,
    message: 'All notifications marked as read',
    data: {
      updated: result[0],
    },
  };
}

@Patch(':id/read')
@ApiOperation({ summary: 'Mark notification as read' })
async markAsRead(
  @Req() req: any,
  @Param('id', ParseIntPipe) notificationId: number,
) {
  const user = req.user;

  const businessUnitId =
    user.role === 'superadmin'
      ? user.selectedBusinessUnitId
      : user.businessUnitId;

  await this.notificationService.markAsRead(
    businessUnitId,
    user.id,
    notificationId,
  );

  return {
    success: true,
    message: 'Notification marked as read',
  };
}


  @Delete(':id')
  @ApiOperation({ summary: 'Delete single notification' })
  async deleteNotification(
    @Req() req: any,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    const user = req.user;
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    await this.notificationService.deleteNotification(
      businessUnitId,
      user.id,
      notificationId,
    );

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  async deleteAllNotifications(@Req() req: any) {
    const user = req.user;
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    await this.notificationService.deleteAllNotifications(
      businessUnitId,
      user.id,
    );

    return {
      success: true,
      message: 'All notifications deleted',
    };
  }
}