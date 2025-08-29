import { Body, Controller, Get, HttpStatus, OnModuleInit, Post, Query, Res } from '@nestjs/common';
import type { WhatsappNotification, WhatsappNotificationTextMessage } from '@daweto/whatsapp-api-types'
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
    // console.log(body)
    this.logger.info(body, 'Webhook received');

    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    this.logger.debug(`Webhook Messages:\n${JSON.stringify(messages, null, 2)}`);

    const entry = body.entry?.[0]?.changes?.[0]?.value;

    // Handle status errors
    entry?.statuses?.forEach(status =>
      status.errors?.forEach(error => this.logger.error(error.title))
    );

    // Handle text messages
    const message = entry?.messages?.[0] as WhatsappNotificationTextMessage | undefined;
    if (message && (message.type as string) === 'text') {
      const { from, text } = message;
      if (from && text?.body) {
        this.whatsappGateway.emitIncomingMessage(from, { from, text: text.body });
      }
    }

    return res.sendStatus(HttpStatus.OK);
  }
}

