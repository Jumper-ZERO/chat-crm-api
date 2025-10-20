import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PinoLogger } from "nestjs-pino";
import { NotificationsService } from "./notifications.service";

@Controller('/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationsService,
    private readonly logger: PinoLogger
  ) { }

  @Get()
  async getAll() {
    const notifications = await this.notificationService.getAll();

    return notifications.map(({ createdAt: time, ...rest }) => ({
      time,
      ...rest,
    }))
  }

  @Post("/read")
  async maskAsRead(@Body() ids: string[]) {
    const result = await this.notificationService.markAsRead(ids).catch((err) => {
      this.logger.error(err, "Error in bulk update for notifications")
    });
    return { success: !!result?.affected }
  }
}