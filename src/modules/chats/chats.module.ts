import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from 'src/modules/chats/entities/chat-session.entity';
import { ChatTransfer } from 'src/modules/chats/entities/chat-transfer.entity';
import { ChatMessage } from 'src/modules/chats/entities/chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, ChatMessage, ChatTransfer])],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
