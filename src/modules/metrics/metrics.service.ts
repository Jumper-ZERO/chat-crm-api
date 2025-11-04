import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, endOfMonth, endOfToday, startOfDay, startOfMonth, startOfToday, subDays, subHours, subMonths } from 'date-fns';
import { Between, IsNull, Repository } from 'typeorm';
import { Chat, Message, Transfer } from '../chats/entities';
import { SentimentAnalysis } from '../whatsapp/entities/sentiment-analysis.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Transfer) private transferRepo: Repository<Transfer>,
    @InjectRepository(SentimentAnalysis) private sentimentRepo: Repository<SentimentAnalysis>,
  ) { }

  async kpis() {
    const [activeChats, messagesThisMonth, agentsActive, transfersThisMonth] = await Promise.all([
      this.activeChats(),
      this.messageThiMonth(),
      this.agentActiveByDay(),
      this.transfersThisMonth(),
    ])

    return { activeChats, messagesThisMonth, agentsActive, transfersThisMonth };
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

  async messageThiMonth() {
    const now = new Date();

    const current = await this.messageRepo.count({
      where: {
        createdAt: Between(
          startOfMonth(now),
          endOfMonth(now)
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

  async agentActiveByDay() {
    const now = new Date()
    const todayStart = startOfMonth(now)
    const todayEnd = endOfMonth(now)
    const yesterdayStart = startOfMonth(subDays(now, 1))
    const yesterdayEnd = endOfMonth(subDays(now, 1))

    const current = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne<{ count: string }>()
      .then((res: { count: string }) => Number(res.count))

    const previous = await this.messageRepo
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.agentId)', 'count')
      .where('message.createdAt BETWEEN :start AND :end', {
        start: yesterdayStart,
        end: yesterdayEnd,
      })
      .andWhere('message.agentId IS NOT NULL')
      .getRawOne<{ count: string }>()
      .then((res: { count: string }) => Number(res.count))

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

  async transfersThisMonth() {
    const current = await this.transferRepo.count({
      where: {
        createdAt: Between(startOfMonth(new Date()), endOfMonth(new Date())),
        deletedAt: IsNull(),
      },
    });

    const previous = await this.transferRepo.count({
      where: {
        createdAt: Between(
          startOfMonth(subMonths(new Date(), 1)),
          endOfMonth(subMonths(new Date(), 1))
        ),
        deletedAt: IsNull(),
      },
    });

    // const change = previous === 0 ? 0 : (current - previous) / previous;
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

  async getMonthlySentimentTrend(): Promise<{
    date: string; // 'YYYY-MM-DD'
    pos: number;
    neg: number;
    neu: number;
  }[]> {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const raw = await this.sentimentRepo
      .createQueryBuilder('sentiment')
      .select([
        "DATE(sentiment.createdAt) AS date",
        "AVG(sentiment.pos) AS pos",
        "AVG(sentiment.neg) AS neg",
        "AVG(sentiment.neu) AS neu",
      ])
      .where('sentiment.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(sentiment.createdAt)')
      .orderBy('DATE(sentiment.createdAt)', 'ASC')
      .getRawMany<{
        date: string; // 'YYYY-MM-DD'
        pos: string;
        neg: string;
        neu: string;
      }>();

    return raw.map(({ date, pos, neg, neu }) => ({
      date,
      pos: parseFloat(pos ?? '0'),
      neg: parseFloat(neg ?? '0'),
      neu: parseFloat(neu ?? '0'),
    }));
  }

  async getTopContacts() {
    const now = new Date();

    const results = await this.messageRepo
      .createQueryBuilder('message')
      .select('contact.id', 'id')
      .addSelect('contact.username', 'username')
      .addSelect('contact.firstNames', 'firstNames')
      .addSelect('contact.lastNames', 'lastNames')
      .addSelect('contact.phoneNumber', 'phoneNumber')
      .addSelect('contact.profile', 'profile')
      .addSelect('COUNT(*)', 'messageCount')
      .innerJoin('message.contact', 'contact')
      .where('message.createdAt >= :start', { start: startOfMonth<Date>(now) })
      .groupBy('contact.id')
      .orderBy('messageCount', 'DESC')
      .limit(5)
      .getRawMany<{
        id: string
        username: string
        firstNames: string
        lastNames: string
        phoneNumber: string
        profile?: string
        messageCount: number
      }>()

    return results
  }
}
