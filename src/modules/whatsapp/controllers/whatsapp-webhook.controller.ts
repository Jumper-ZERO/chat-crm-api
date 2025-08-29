import { Body, Controller, Get, HttpStatus, OnModuleInit, Post, Query, Res } from '@nestjs/common';
import type { WhatsappNotification, WhatsappNotificationMessage, WhatsappNotificationStatus, WhatsappNotificationTextMessage, WhatsappNotificationValue } from '@daweto/whatsapp-api-types'
import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { WhatsAppConfig } from '../entities';
import { WhatsAppConfigService } from '../services/whatsapp-config.service';
import { WhatsappGateway } from '../whatsapp.gateway';

@Controller('whatsapp/webhook')
export class WhatsappWebhookController implements OnModuleInit {
  private config: WhatsAppConfig | null = null;

  constructor(
    private readonly whatsappGateway: WhatsappGateway,
    private readonly whatsappConfig: WhatsAppConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WhatsappWebhookController.name)
  }

  async onModuleInit() {
    this.config = await this.whatsappConfig.getConfigActive();
  }

  extractFromValue<T>(body: WhatsappNotification, key: keyof WhatsappNotificationValue): T[] {
    const result = body.entry
      ?.flatMap(entry => entry.changes ?? [])
      .map(change => change.value?.[key])
      .filter(items => Array.isArray(items))
      .flat() ?? [];

    return result as T[];
  }

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode === 'subscribe' && token === this.config?.verifyToken) {
      this.logger.info('WEBHOOK VERIFIED')
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }



  // TODO: Best handler for webhook (implemented service, processor)
  @Post()
  handleWebhook(@Body() body: WhatsappNotification, @Res() res: Response): Response {
    const statuses = this.extractFromValue<WhatsappNotificationStatus>(body, 'statuses');
    const messages = this.extractFromValue<WhatsappNotificationMessage>(body, 'messages');

    // Handle status errors
    statuses?.forEach(status =>
      status?.errors?.forEach(error => this.logger.error(`${error.title}: ${error.error_data.details}`))
    );

    // Handle text messages
    messages?.forEach(raw => {
      this.logger.debug(`Webhook Messages:\n${JSON.stringify(raw, null, 2)}`); // Debug
      if ((raw.type as string) !== 'text') return;

      const { from, text } = raw as WhatsappNotificationTextMessage;
      if (!from || !text?.body) return;

      this.whatsappGateway.emitIncomingMessage(from, { from, text: text.body });
    });

    return res.sendStatus(HttpStatus.OK);
  }
}

