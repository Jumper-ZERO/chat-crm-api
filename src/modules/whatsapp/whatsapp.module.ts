import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SentimentService } from './services/sentiment.service';
import { WebhookService } from './services/webhook.service';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
import { SentimentAnalysis } from './entities/sentiment-analysis.entity';
import { WhatsAppConfigController, WhatsappController, WhatsappWebhookController } from './controllers';
import { WhatsAppConfig } from './entities';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { WhatsAppConfigSubscriber } from './subscribers/whatsapp-config.subscriber';
import { WhatsAppApiClient } from './whatsapp-api.client';
import { WhatsappGateway } from './whatsapp.gateway';
import { ChatsService } from '../chats/chats.service';
import { Chat, Message } from '../chats/entities';
import { ContactsService } from '../contacts/contacts.service';
import { Contact } from '../contacts/entities/contact.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SentimentClient } from './clients/sentiment.client';
import { SentimentProcessor } from './processors/sentiment.processor';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      Message,
      Contact,
      User,
      WhatsAppConfig,
      Chat,
      SentimentAnalysis,
    ]),
    BullModule.registerQueue({
      name: 'sentiment'
    }),
    HttpModule,
    NotificationsModule,
    forwardRef(() => ChatsModule)
  ],
  controllers: [WhatsappController, WhatsappWebhookController, WhatsAppConfigController],
  providers: [
    WebhookService,
    WhatsappService,
    WhatsAppConfigService,
    WhatsappGateway,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
    WhatsAppMessageFactory,
    ChatsService,
    ContactsService,
    UsersService,
    SentimentClient,
    SentimentProcessor,
    SentimentService,
  ],
  exports: [
    WhatsAppConfigService,
    WhatsAppApiClient,
    BullModule,
  ],
})
export class WhatsappModule { }
