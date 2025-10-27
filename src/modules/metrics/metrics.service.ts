import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, endOfMonth, endOfToday, startOfDay, startOfMonth, startOfToday, subDays, subHours, subMonths } from 'date-fns';
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

  buildKPI(current: number, previous: number): { value: number; porcentLastMonth: string } {
    const change = previous === 0 ? 0 : (current - previous) / previous;
    const percentage = (change * 100).toFixed(2);
    const sign = change >= 0 ? '+' : '';
    return {
      value: current,
      porcentLastMonth: `${sign}${percentage}%`,
    };
  }

  async activeChats() {
    const current = await this.chatRepo.count({
      where: {
        endedAt: IsNull(),
        deletedAt: IsNull()
      }
    })

    const previous = await this.chatRepo.count({
      where: {
        endedAt: IsNull(),
        deletedAt: IsNull(),
        createdAt: Between(
          startOfMonth(subMonths(new Date(), 1)),
          endOfMonth(subMonths(new Date(), 1))
        ),
      },
    })

    return this.buildKPI(current, previous)
  }

  async messageToday() {
    const current = await this.messageRepo.count({
      where: {
        createdAt: Between(
          startOfToday(),
          endOfToday()
        ),
        deletedAt: IsNull(),
      },
    })

    const previous = await this.messageRepo.count({
      where: {
        createdAt: Between(
          startOfMonth(subDays(new Date(), 1)),
          endOfDay(subDays(new Date(), 1))
        )
      }
    })

    return this.buildKPI(current, previous)
  }

  async agentActive() {
    const now = new Date();
    const threshold: Date = subHours(new Date(), 1);
    const previousThreshold = subHours(now, 2);

    const current = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt > :threshold', { threshold })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne<{ count: string }>()
      .then((res: { count: string }) => Number(res.count))

    const previous = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt BETWEEN :start AND :end', {
        start: previousThreshold,
        end: threshold,
      })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne()
      .then((res: { count: string }) => Number(res.count))

    return this.buildKPI(current, previous)
  }

  async sentimentToday() {
    const today = {
      start: startOfToday(),
      end: endOfToday()
    };
    const yesterday = {
      start: startOfDay(subDays(new Date(), 1)),
      end: endOfDay(subDays(new Date(), 1))
    }

    const current = await this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        'AVG(sentiment.pos) AS avgPos',
        'AVG(sentiment.neg) AS avgNeg',
        'AVG(sentiment.neu) AS avgNeu',
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', today)
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

    const previous = await this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        'AVG(sentiment.pos) AS avgPos',
        'AVG(sentiment.neg) AS avgNeg',
        'AVG(sentiment.neu) AS avgNeu',
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', yesterday)
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

    return {
      pos: this.buildKPI(current.pos, previous.pos),
      neg: this.buildKPI(current.neg, previous.neg),
      neu: this.buildKPI(current.neu, previous.neu),
    }
  }
}
