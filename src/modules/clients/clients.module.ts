import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientDetail } from 'src/modules/clients/entities/client-details.entity';
import { Client } from 'src/modules/clients/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientDetail])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}
