import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppConfigController, WhatsappController, WhatsappWebhookController } from './controllers';
import { WhatsAppConfig, WhatsAppContact, WhatsAppMessage, WhatsAppTemplate } from './entities';
import { WhatsappGateway } from './whatsapp.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      WhatsAppConfig,
      WhatsAppTemplate,
      WhatsAppMessage,
      WhatsAppContact,
    ]),
    HttpModule
  ],
  controllers: [WhatsappController, WhatsappWebhookController, WhatsAppConfigController],
  providers: [WhatsappService, WhatsAppConfigService, WhatsappGateway],
})
export class WhatsappModule { }
