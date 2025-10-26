import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { ChatsModule } from '../chats/chats.module';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SentimentAnalysis]),
    ChatsModule
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule { }
