import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookService } from './services/webhook.service';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
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
      Chat
    ]),
    HttpModule,
    NotificationsModule
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
  ],
  exports: [WhatsAppConfigService, WhatsAppApiClient],
})
export class WhatsappModule { }
