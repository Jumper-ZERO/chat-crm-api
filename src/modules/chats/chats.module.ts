import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat, Message, Transfer } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, Transfer])],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule { }
