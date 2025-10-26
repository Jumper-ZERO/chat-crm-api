import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfToday, startOfToday, subHours } from 'date-fns';
import { Between, IsNull, Repository } from 'typeorm';
import { Chat, Message } from '../chats/entities';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(SentimentAnalysis) private sentimentRepo: Repository<SentimentAnalysis>,
  ) { }

  async kpis() {
    const [activeChats, messagesToday, agentsActive, sentimentToday] = await Promise.all([
      this.activeChats(),
      this.messageToday(),
      this.agentActive(),
      this.sentimentToday()
    ])

    return { activeChats, messagesToday, agentsActive, sentimentToday };
  }

  async activeChats() {
    return this.chatRepo.count({
      where: {
        endedAt: IsNull(),
        deletedAt: IsNull()
      }
    })
  }

  async messageToday() {
    return this.messageRepo.count({
      where: {
        createdAt: Between(
          startOfToday(),
          endOfToday()
        ),
        deletedAt: IsNull(),
      },
    })
  }

  async agentActive() {
    const threshold: Date = subHours(new Date(), 1);

    return this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt > :threshold', { threshold })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne()
      .then((res: { count: string }) => Number(res.count))
  }

  async sentimentToday() {
    const start: Date = startOfToday();
    const end: Date = endOfToday();

    return this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        'AVG(sentiment.pos) AS avgPos',
        'AVG(sentiment.neg) AS avgNeg',
        'AVG(sentiment.neu) AS avgNeu',
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', {
        start,
        end,
      })
      .getRawOne()
      .then((res: {
        avgPos: string | null;
        avgNeg: string | null;
        avgNeu: string | null
      }) => ({
        pos: parseFloat(res.avgPos ?? '0'),
        neg: parseFloat(res.avgNeg ?? '0'),
        neu: parseFloat(res.avgNeu ?? '0'),
      }))
  }
}
