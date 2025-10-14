import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { JwtPayload } from "../../../auth/auth.types";
import { SendMessageDto } from "../dto/send-message.dto";
import { WhatsappService } from "../whatsapp.service";

@Controller('whatsapp')
@UseGuards(AuthGuard('jwt'))
export class WhatsappController {
  constructor(
    private readonly service: WhatsappService
  ) { }

  @Post('send')
  async sendMessage(@Body() body: SendMessageDto) {
    const success = await this.service.sendMessage(body.to, body.message);
    return { success, message: 'Message sent' };
  }

  @Post('send/template')
  async sendTemplateMessage(@Req() req: Request, @Body() body: { to: string }) {
    const user = req.user as JwtPayload;
    const success = await this.service.sendTemplateMessage(body.to, 'hello_world', 'en_US', user.companyId);
    return { success, message: 'Template message sent' };
  }
}