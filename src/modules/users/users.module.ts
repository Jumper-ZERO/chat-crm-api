import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { IsInDatabaseConstraint } from '../../utils/validators/IsInDatabase';
import { Chat } from '../chats/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat])],
  controllers: [UsersController],
  providers: [UsersService, IsInDatabaseConstraint],
  exports: [UsersService]
})
export class UsersModule { }
