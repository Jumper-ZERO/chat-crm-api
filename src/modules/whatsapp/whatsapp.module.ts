import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppConfigController, WhatsappController, WhatsappWebhookController } from './controllers';
import { WhatsAppConfig } from './entities';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { WhatsAppConfigSubscriber } from './subscribers/whatsapp-config.subscriber';
import { WhatsAppApiClient } from './whatsapp-api.client';
import { WhatsappGateway } from './whatsapp.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      WhatsAppConfig,
    ]),
    HttpModule
  ],
  controllers: [WhatsappController, WhatsappWebhookController, WhatsAppConfigController],
  providers: [
    WhatsappService,
    WhatsAppConfigService,
    WhatsappGateway,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
    WhatsAppMessageFactory,
  ],
  exports: [WhatsAppConfigService, WhatsAppApiClient],
})
export class WhatsappModule { }
