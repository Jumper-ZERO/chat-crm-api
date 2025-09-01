import { Body, Controller, Post } from "@nestjs/common";
import { SendMessageDto } from "../dto/send-message.dto";
import { WhatsappService } from "../whatsapp.service";

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly service: WhatsappService
  ) { }
  @Post('send')
  async sendMessage(@Body() body: SendMessageDto) {
    const success = await this.service.sendMessage(body.to, body.message);
    return { success, message: 'Message sent' };
  }
}