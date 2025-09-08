import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { I18nModule } from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';

// Configurations
import { cacheConfig } from './config/cache.config';
import { databaseConfig } from './config/database.config';
import { i18nConfig } from './config/i18n.config';
import { loggerConfig } from './config/logger.config';

// Controllers & Services
import { AppController } from './app.controller';

import { AppService } from './app.service';

// Utils
import { IsUniqueConstraint } from './utils/validators';

// Modules
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot(i18nConfig),
    LoggerModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot(databaseConfig),
    CacheModule.registerAsync(cacheConfig),
    UsersModule,
    ClientsModule,
    ChatsModule,
    AuthModule,
    WhatsappModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})

export class AppModule { }
