import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import type { // Usa 'type' para los tipos (interfaces/clases)
  WhatsappNotification,
  WhatsappNotificationDocumentMessage,
  WhatsappNotificationImageMessage,
  WhatsappNotificationMessage,
  WhatsappNotificationStatus,
  WhatsappNotificationTextMessage,
  WhatsappNotificationValue,
  WhatsappNotificationVideoMessage
} from '@daweto/whatsapp-api-types'
import type { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { ChatsService } from '../../chats/chats.service';
import { WhatsAppConfigService } from '../services/whatsapp-config.service';
import { WhatsappGateway } from '../whatsapp.gateway';

@Controller('whatsapp/webhook')
export class WhatsappWebhookController {
  constructor(
    private readonly whatsappGateway: WhatsappGateway,
    private readonly whatsappConfig: WhatsAppConfigService,
    private readonly chats: ChatsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WhatsappWebhookController.name)
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
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const config = await this.whatsappConfig.getActiveByVerifyToken(token);

    if (mode === 'subscribe' && token === config?.webhookVerifyToken) {
      this.logger.info('WEBHOOK VERIFIED')
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      return res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  // TODO: Best handler for webhook (implemented service, processor)
  @Post()
  async handleWebhook(@Body() body: WhatsappNotification, @Res() res: Response): Promise<Response> {
    const statuses = this.extractFromValue<WhatsappNotificationStatus>(body, 'statuses');
    const messages = this.extractFromValue<WhatsappNotificationMessage>(body, 'messages');

    // Manejo de estados y errores (asumimos que ya tienes tipado el error correctamente)
    statuses?.forEach(status =>
      status?.errors?.forEach(error => {
        const err = error as { title: string, error_data: { details: string } };
        this.logger.error(`${err.title}: ${err.error_data.details}`);
      })
    );

    // 🎯 Procesamiento de mensajes entrantes
    for (const rawMessage of messages || []) {
      try {
        this.logger.debug(`Webhook Message: ${JSON.stringify(rawMessage)}`);

        const phone = rawMessage.from;
        if (!phone) continue;

        // 1. Usar el extractor para obtener contenido y mediaUrl
        const { body: content, mediaUrl } = this.extractMessageData(rawMessage);

        if (!content) continue;

        // 2. Buscar o crear el Chat (Contact)
        const chat = await this.chats.findOrCreateByPhone(phone);

        // 3. Guardar el mensaje en la DB
        await this.chats.addMessage(chat.id, {
          from: phone,
          body: content,
          direction: 'incoming', // Siempre es entrante desde el webhook
          mediaUrl: mediaUrl,
        });

        // 4. Emitir a la Gateway para actualizar el frontend
        this.whatsappGateway.emitIncomingMessage(phone, { from: phone, text: content });

      } catch (error: unknown) {
        // Manejo seguro del error (como lo corregimos antes)
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(`Error processing WhatsApp message: ${errorMsg}`, errorStack);
      }
    }

    // Devolver respuesta OK a WhatsApp
    return res.sendStatus(HttpStatus.OK);
  }

  private extractMessageData(raw: WhatsappNotificationMessage): { body: string | null, type: string, mediaUrl: string | undefined } {
    const type = raw.type as string;

    let content: string | null = null;
    let mediaUrl: string | undefined;

    if (type === 'text') {
      const textMsg = raw as WhatsappNotificationTextMessage;
      content = textMsg.text?.body || null;

    } else if (type === 'image') {
      const mediaData = raw as WhatsappNotificationImageMessage;
      content = mediaData.image?.caption || `[IMAGEN recibida]`;
      mediaUrl = `whatsapp-media/${mediaData.image?.id}`;

    } else if (type === 'video') {
      const mediaData = raw as WhatsappNotificationVideoMessage;
      content = mediaData.video?.caption || `[VIDEO recibido]`;
      mediaUrl = `whatsapp-media/${mediaData.video?.id}`;

    } else if (type === 'document') {
      const mediaData = raw as WhatsappNotificationDocumentMessage;
      content = mediaData.document?.caption || `[DOCUMENTO recibido]`;
      mediaUrl = `whatsapp-media/${mediaData.document?.id}`;
    } else {
      content = `[Mensaje de tipo ${type} recibido]`;
    }

    return { body: content, type, mediaUrl };
  }
}

