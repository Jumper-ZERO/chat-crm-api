import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { ChatsModule } from '../chats/chats.module';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SentimentAnalysis]),
    WhatsappModule,
    ChatsModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [TypeOrmModule, MetricsService],
})
export class MetricsModule { }
