import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { WhatsAppApiClient } from './whatsapp-api.client';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly config: WhatsAppConfigService,
    private readonly client: WhatsAppApiClient,
    private readonly factory: WhatsAppMessageFactory,
    private readonly logger: PinoLogger,
  ) { this.logger.setContext(WhatsappService.name) }

  async sendTextMessage(to: string, message: string, companyId: string) {
    const { apiBaseUrl, apiVersion, phoneNumberId, accessToken } = await this.config.getActiveByCompany(companyId);
    const url = `${apiBaseUrl}/${apiVersion}/${phoneNumberId}/messages`;
    const payload = this.factory.text(to, message);

    return this.client.sendMessage(url, accessToken, payload).catch(err => {
      this.logger.debug(`Info request WhatsApp API: ${apiBaseUrl} - ${apiVersion} - ${phoneNumberId}`);
      this.logger.debug(`Payload request WhatsApp API: ${JSON.stringify(payload, null, 2)}`);
      this.logger.debug(`Error sending message to ${to}`);
      throw err;
    });
  }

  async sendMessage(to: string, message: string) {
    const { apiBaseUrl, phoneNumberId, accessToken } = await this.config.active();
    const url = `${apiBaseUrl}/${phoneNumberId}/messages`;
    const payload = this.factory.text(to, message);

    return this.client.sendMessage(url, accessToken, payload);
  }
}
