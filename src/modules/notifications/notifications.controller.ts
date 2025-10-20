import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { NotificationsService } from "./notifications.service";

@Controller('/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationsService
  ) { }

  @Get()
  async getAll() {
    const notifications = await this.notificationService.getAll();

    return notifications.map(({ createdAt: time, ...rest }) => ({
      time,
      ...rest,
    }))
  }
}