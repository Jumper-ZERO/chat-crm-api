import { HttpService } from "@nestjs/axios";
import { Body, Controller, Post } from "@nestjs/common";

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly http: HttpService) { }
  @Post('send')
  async sendMessage(@Body() body: { to: string; message: string }) {
    const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: body.to, // Ej: "51999999999"
      type: 'text',
      text: { body: body.message },
    };

    const headers = {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const response = await this.http.axiosRef.post(url, payload, { headers });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  }
}