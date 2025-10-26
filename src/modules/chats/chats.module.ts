import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController, MessagesController } from './controllers';
import { Chat, Message, Transfer } from './entities';
import { Contact } from '../contacts/entities/contact.entity';
import { User } from '../users/entities/user.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

const TypeOrmFeatureModule = TypeOrmModule.forFeature([Chat, Message, Contact, User, Transfer]);

@Module({
  imports: [
    TypeOrmFeatureModule,
    forwardRef(() => WhatsappModule)
  ],
  controllers: [ChatsController, MessagesController],
  providers: [ChatsService],
  exports: [TypeOrmFeatureModule, ChatsService]
})
export class ChatsModule { }
