import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AcceptLanguageResolver,
  I18nModule,
  I18nYamlLoader,
  QueryResolver,
} from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ClientsModule } from './modules/clients/clients.module';
import { LogsModule } from './modules/logs/logs.module';
import { UsersModule } from './modules/users/users.module';
import { IsUniqueConstraint } from './utils/validators';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loader: I18nYamlLoader,
      loaderOptions: {
        path: path.join(__dirname, '../locales/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            translateTime: 'dd/mm/yyyy, h:MM:ss TT',
            levelFirst: false,
            messageFormat: '[Chat Crm] {level} [{context}] {msg}',
          },
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*.ts'],
      synchronize: true, // This only in development, not recommended for production
    }),
    UsersModule,
    ClientsModule,
    ChatsModule,
    LogsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})

export class AppModule { }
