import { Injectable } from '@nestjs/common';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { WhatsAppApiClient } from './whatsapp-api.client';

@Injectable()
export class WhatsappService {
  private readonly apiUrl = "https://graph.facebook.com/v23.0";

  constructor(
    private readonly config: WhatsAppConfigService,
    private readonly client: WhatsAppApiClient,
    private readonly factory: WhatsAppMessageFactory,
  ) { }

  async sendMessage(to: string, message: string) {
    const { apiBaseUrl, phoneNumberId, accessToken } = await this.config.active();
    const url = `${apiBaseUrl}/${phoneNumberId}/messages`;
    const payload = this.factory.text(to, message);

    return this.client.sendMessage(url, accessToken, payload);
  }
}
