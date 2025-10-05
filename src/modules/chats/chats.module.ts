import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController, MessagesController } from './controllers';
import { Chat, Message } from './entities';
import { Contact } from '../contacts/entities/contact.entity';
import { User } from '../users/entities/user.entity';

const TypeOrmFeatureModule = TypeOrmModule.forFeature([Chat, Message, Contact, User]);

@Module({
  imports: [TypeOrmFeatureModule],
  controllers: [ChatsController, MessagesController],
  providers: [ChatsService],
  exports: [TypeOrmFeatureModule]
})
export class ChatsModule { }
